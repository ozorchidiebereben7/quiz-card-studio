# SoulMatch — Data Model

**Status:** Draft for review · **Version:** 2.0 · **Date:** 31 July 2026

Postgres schema sketch implementing `eligibility-rules.md`. Target platform is
Supabase (Postgres + PostGIS + Row Level Security + Realtime).

This is a design sketch, not a migration. Types and constraints are indicative.

---

## 1. Why Postgres rather than Firestore

The PRD v1.0 specified Firebase/Firestore. The eligibility rule is the reason to change.

The predicate is a **relational constraint spanning multiple entities**: it reads two
profiles, their campuses, those campuses' institutions, a join table of teaching hospitals,
a geographic distance, and a policy row. In SQL this is one function. In Firestore security
rules it is not expressible at all — rules cannot join, cannot compute geographic distance,
and can only read a small fixed number of other documents.

The Firestore version would require denormalizing campus, institution, city, hospital list,
and geo coordinates onto every profile *and onto every swipe document*, then enforcing the
rule in Cloud Functions, then keeping all those copies consistent as institution data
changes. The invariant would live in application code in several places rather than in one
database function — the exact outcome §1.1 of the eligibility spec warns against.

With Postgres:

- the predicate is **one `stable` function**, testable in isolation with plain SQL
- **RLS** enforces it at the row level, so a hand-crafted API request cannot route around it
  (eligibility test 5)
- PostGIS gives real geographic distance rather than bounding-box approximations
- tuning `min_distance_m` is an `UPDATE`, not an app release

Costs of the change, stated honestly: Supabase has a smaller ecosystem than Firebase, fewer
turnkey mobile SDK conveniences, and the team must be comfortable writing SQL. For a product
whose entire correctness story is one relational predicate, that trade is worth making.

---

## 2. Reference data

```sql
create table institutions (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  short_name    text,
  country_code  char(2) not null default 'NG',
  has_med_school boolean not null default false,
  created_at    timestamptz not null default now()
);

create table teaching_hospitals (
  id      uuid primary key default gen_random_uuid(),
  name    text not null,
  city    text not null,
  state   text not null
);

-- The unit of comparison for the distance rule (see eligibility-rules.md §3.1).
-- Nigerian universities are frequently split across sites; preclinical and clinical
-- years may sit in different cities entirely.
create table campuses (
  id              uuid primary key default gen_random_uuid(),
  institution_id  uuid not null references institutions(id),
  name            text not null,
  city            text not null,
  state           text not null,
  geo             geography(point, 4326) not null,
  -- Manual escape hatch for genuinely co-located campuses of different
  -- institutions (eligibility-rules.md §6, last row).
  social_zone_id  uuid
);

create index on campuses using gist (geo);
create index on campuses (institution_id);

-- Many-to-many: a campus may rotate students through several hospitals,
-- and a hospital may host students from several campuses. Two medical
-- students sharing a hospital will meet, regardless of distance.
create table campus_teaching_hospitals (
  campus_id           uuid not null references campuses(id) on delete cascade,
  teaching_hospital_id uuid not null references teaching_hospitals(id) on delete cascade,
  primary key (campus_id, teaching_hospital_id)
);

-- Server-tunable policy. Single row. Changing the threshold must not
-- require an app release (eligibility-rules.md §3.3).
create table policy (
  id              boolean primary key default true check (id),
  min_distance_m  integer not null default 150000,
  updated_at      timestamptz not null default now()
);
```

---

## 3. Profiles and verification

```sql
create type med_status as enum ('none', 'pending', 'verified', 'expired', 'revoked');

create table profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  display_name      text not null,
  date_of_birth     date not null,
  gender            text,
  seeking           text[],
  bio               text,
  campus_id         uuid references campuses(id),

  -- Medical status. Never trusted from the client; only the verification
  -- pipeline may write these columns.
  med_status        med_status not null default 'none',
  med_verified_at   timestamptz,
  med_verified_until timestamptz,

  -- Discretion preferences (eligibility-rules.md §4.3)
  hide_from_institution boolean not null default false,
  hide_from_contacts    boolean not null default true,

  onboarding_complete boolean not null default false,
  last_active_at    timestamptz,
  created_at        timestamptz not null default now(),

  constraint adult check (date_of_birth <= current_date - interval '18 years'),
  -- A verified medical student must have a campus; the distance rule needs it.
  constraint med_needs_campus check (med_status <> 'verified' or campus_id is not null)
);
```

The `adult` check constraint is a hard database-level gate, not a UI validation. Many
Nigerian medical students matriculate at 16–17, so this will actually reject real signups —
that is the intent.

```sql
create table verifications (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid not null references profiles(id) on delete cascade,
  method          text not null,   -- 'institutional_email' | 'id_card' | 'association'
  claimed_campus_id uuid references campuses(id),
  matric_number   text,
  status          text not null default 'pending',
  reviewer_id     uuid,
  reviewed_at     timestamptz,
  rejection_reason text,

  -- Evidence images are deleted after review. Only the hash survives, so a
  -- resubmission of the same rejected document can be detected without
  -- retaining the document itself.
  evidence_hash   bytea,
  evidence_deleted_at timestamptz,

  created_at      timestamptz not null default now()
);
```

**Retention rule:** student ID card images and verification selfies are sensitive personal
data. They are stored in a private bucket, accessible only to reviewers, and **deleted on
review completion**. What persists is the outcome, the reviewer, the timestamp, and a hash.
See `PRD.md` §10 on the Nigeria Data Protection Act 2023.

---

## 4. The eligibility predicate

This is the direct translation of `eligibility-rules.md` §1.

```sql
-- Effective medical status: verified AND unexpired. A pending claim is NOT medical.
create or replace function is_med(p profiles) returns boolean
language sql stable as $$
  select p.med_status = 'verified'
     and p.med_verified_until is not null
     and p.med_verified_until > now();
$$;

-- distant(): every tier must pass (eligibility-rules.md §3.2)
create or replace function campuses_distant(a uuid, b uuid) returns boolean
language sql stable as $$
  select case
    when ca.id = cb.id                              then false  -- same campus
    when ca.institution_id = cb.institution_id      then false  -- same institution
    when lower(ca.city) = lower(cb.city)
     and lower(ca.state) = lower(cb.state)          then false  -- same city
    when ca.social_zone_id is not null
     and ca.social_zone_id = cb.social_zone_id      then false  -- manual co-location link
    when exists (
      select 1
      from campus_teaching_hospitals x
      join campus_teaching_hospitals y
        on x.teaching_hospital_id = y.teaching_hospital_id
      where x.campus_id = ca.id and y.campus_id = cb.id
    )                                               then false  -- shared wards
    when st_distance(ca.geo, cb.geo)
       < (select min_distance_m from policy)        then false  -- below floor
    else true
  end
  from campuses ca, campuses cb
  where ca.id = a and cb.id = b;
$$;

-- The invariant itself.
create or replace function eligible(a uuid, b uuid) returns boolean
language sql stable as $$
  select
        (is_med(pa) or is_med(pb))
    and (not (is_med(pa) and is_med(pb))
         or campuses_distant(pa.campus_id, pb.campus_id))
    -- opt-in institution hiding, applied symmetrically.
    -- coalesce is load-bearing: a non-medical user may have no campus, so
    -- ca/cb can be null, and `null = null` is null rather than false. Without
    -- coalesce the whole predicate evaluates to null instead of true, and RLS
    -- treats null as false — silently hiding profiles that should be visible.
    and not coalesce(
      (pa.hide_from_institution or pb.hide_from_institution)
      and ca.institution_id = cb.institution_id
    , false)
  from profiles pa
  join profiles pb on pb.id = b
  left join campuses ca on ca.id = pa.campus_id
  left join campuses cb on cb.id = pb.campus_id
  where pa.id = a;
$$;
```

**Three-valued logic needs care throughout this predicate.** Postgres nulls do not behave
like false, and this function is the one place in the system where a silent null would be
catastrophic rather than merely wrong.

`campuses_distant` returns null if either campus is null. In the second clause this is safe:
the case only arises when at least one party is non-medical, which makes
`not (is_med(pa) and is_med(pb))` true, and `true or null` is true. When both parties *are*
medical, the `med_needs_campus` constraint guarantees both campuses exist, so the null case
is unreachable by construction.

The third clause has no such protection, hence the explicit `coalesce`. Tests should assert
both cases rather than rely on the reasoning above — a medical user viewing a non-medical
user with no campus set must be eligible, and that is exactly the assertion that fails if
the coalesce is ever removed.

### 4.1 Enforcement via RLS

The predicate governs *visibility*, so it belongs in a row-level security policy rather than
only in application queries. This is what makes eligibility test 5 pass — a hand-crafted
request naming an ineligible profile returns nothing, because the row is not visible to that
session at all.

```sql
alter table profiles enable row level security;

create policy discover_eligible_only on profiles
for select using (
  id = auth.uid()
  or (
    eligible(auth.uid(), id)
    and not exists (
      select 1 from blocks
      where (blocker_id = auth.uid() and blocked_id = profiles.id)
         or (blocker_id = profiles.id and blocked_id = auth.uid())
    )
  )
);
```

Because the deck, search, "who liked you," and every count are all built on top of
`profiles`, filtering happens once at the row level and every downstream surface inherits it.
This is precisely the property §4.2 of the eligibility spec demands: counts cannot
accidentally be computed over an unfiltered set, because the unfiltered set is not reachable.

**Performance note:** `eligible()` in an RLS policy runs per candidate row. At pilot scale
this is fine. Before national rollout, the deck query should be served from a materialized
candidate set refreshed on profile or policy change, with RLS retained as the correctness
backstop rather than the primary filter.

---

## 5. Interaction tables

```sql
create table swipes (
  actor_id   uuid not null references profiles(id) on delete cascade,
  target_id  uuid not null references profiles(id) on delete cascade,
  direction  text not null check (direction in ('like', 'pass', 'super')),
  created_at timestamptz not null default now(),
  primary key (actor_id, target_id)
);

create table matches (
  id          uuid primary key default gen_random_uuid(),
  user_a      uuid not null references profiles(id) on delete cascade,
  user_b      uuid not null references profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  -- 'grandfathered' preserves conversations when a verification lapses
  -- (eligibility-rules.md §2); 'suspended' is used for revocation.
  state       text not null default 'active'
              check (state in ('active', 'grandfathered', 'suspended', 'unmatched')),
  -- canonical ordering prevents duplicate (A,B)/(B,A) rows
  constraint ordered check (user_a < user_b),
  unique (user_a, user_b)
);

create table messages (
  id          uuid primary key default gen_random_uuid(),
  match_id    uuid not null references matches(id) on delete cascade,
  sender_id   uuid not null references profiles(id) on delete cascade,
  kind        text not null check (kind in ('text', 'voice', 'image')),
  body        text,
  media_path  text,
  duration_ms integer,               -- voice notes
  reply_to_id uuid references messages(id),
  created_at  timestamptz not null default now(),
  read_at     timestamptz
);

create index on messages (match_id, created_at desc);
```

A trigger on `matches` re-checks `eligible()` at insert time. RLS already prevents the swipe
that would create an ineligible match, but the invariant is important enough to enforce at
both layers — defence in depth on the one rule the product cannot afford to get wrong.

```sql
create table blocks (
  blocker_id uuid not null references profiles(id) on delete cascade,
  blocked_id uuid not null references profiles(id) on delete cascade,
  reason     text,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);

create table reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid not null references profiles(id) on delete set null,
  reported_id  uuid not null references profiles(id) on delete cascade,
  match_id     uuid references matches(id),
  category     text not null,
  detail       text,
  status       text not null default 'open',
  resolution   text,
  handled_by   uuid,
  handled_at   timestamptz,
  created_at   timestamptz not null default now()
);
```

Moderators may read messages **only** for a `match_id` attached to an open report. This is
scoped access, and it is why the product cannot claim end-to-end encryption — see `PRD.md`
§9.2, which states this plainly rather than overclaiming.

---

## 6. Invites and waitlist

Implements the med-first intake strategy (`PRD.md` §6).

```sql
create table invites (
  code         text primary key,
  issuer_id    uuid not null references profiles(id) on delete cascade,
  redeemed_by  uuid references profiles(id),
  redeemed_at  timestamptz,
  expires_at   timestamptz not null,
  created_at   timestamptz not null default now()
);

create table waitlist (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  phone       text,
  state       text,
  campus_id   uuid references campuses(id),
  released_at timestamptz,
  created_at  timestamptz not null default now()
);
```

Only verified medical students may issue invite codes; the issuance trigger checks
`is_med()`. Quota per issuer is server-side configuration, tunable alongside
`min_distance_m` — both are levers on the same liquidity problem.

---

## 7. Subscriptions

```sql
create table subscriptions (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid not null references profiles(id) on delete cascade,
  tier          text not null check (tier in ('free', 'plus', 'premium')),
  -- 'apple' | 'google' for in-app; 'paystack' for web only (PRD.md §8)
  provider      text not null,
  provider_ref  text,
  current_period_end timestamptz,
  -- Verified medical students receive premium at no cost, permanently.
  comped        boolean not null default false,
  created_at    timestamptz not null default now()
);
```

Entitlement is derived, not stored on the profile: a user has premium if they hold an active
paid subscription **or** `is_med()` is true. Deriving it means a lapsed verification cannot
leave someone holding a comped entitlement they no longer qualify for.

---

## 8. Open modelling questions

- **Rotation-aware campus assignment.** Clinical students rotate between hospitals. Modelling
  a current posting separately from a home campus is more accurate but adds churn to
  eligibility. Deferred — see `open-questions.md` §4.
- **Photo storage and moderation queue.** Not modelled here; depends on the moderation
  tooling decision.
- **Analytics events.** Should live outside the transactional schema.
- **Soft delete and NDPA erasure.** Deletion rights require a documented cascade. Note that
  `reports.reporter_id` is `on delete set null` deliberately, so that erasing a reporter does
  not destroy the safety record of the person they reported.
