# SoulMatch — Eligibility & Discretion Rules

**Status:** Draft for review · **Version:** 2.0 · **Date:** 31 July 2026

This document specifies who may see and match whom. It is the single most important
specification in the product: every other feature assumes it holds. It is written to be
precise enough to implement and to write tests against.

---

## 1. The invariant

The product rule was originally stated as three cases:

- medical × medical — only if the schools are far apart
- medical × non-medical — allowed, distance irrelevant
- non-medical × non-medical — never

These collapse into **one invariant**:

> **Every match must contain at least one verified medical student**, and where *both*
> parties are medical students, their campuses must be socially distant.

Formally:

```
eligible(A, B) :=
      (med(A) OR med(B))                                  -- (1) kills non-med × non-med
  AND (NOT (med(A) AND med(B)) OR distant(A.campus, B.campus))   -- (2) med × med needs distance
```

Two properties follow, and both matter:

- **It is symmetric.** `eligible(A, B) = eligible(B, A)`. There is no direction in which
  one party can see the other but not vice versa.
- **It is enforced in exactly one place.** The predicate lives server-side and governs
  *discovery*, not just match creation (see §4). No client, premium tier, boost, or
  admin convenience may bypass it.

### 1.1 Why state it as one rule

The three-case phrasing invites three separate code paths, and three code paths mean three
places to get it wrong. The single predicate has one implementation, one test suite, and one
audit surface. It is also easier to reason about the failure mode: if the predicate is
correct and it is the only gate, the product rule cannot be violated.

---

## 2. `med(X)` — what counts as a medical student

`med(X)` is **not** a self-declared field. It is true only when:

```
med(X) := X.med_verification_status = 'verified'
      AND X.med_verified_until > now()
```

This has three deliberate consequences.

**Unverified means non-medical.** A user who has claimed medical status but whose review is
still pending is treated as non-medical for every eligibility decision. They are not held in
limbo — they can use the app immediately — they simply have a non-medical user's reach until
review completes. This removes any value in submitting a claim and swiping while it is
pending.

**Verification expires.** Students graduate. `med_verified_until` defaults to the end of the
current academic year, after which the user reverts to non-medical until they re-verify.

**Expiry does not destroy existing matches.** When a user's medical status lapses, existing
matches and conversations are **grandfathered** — they remain open. Only *future* discovery
is affected. Silently deleting someone's conversations because a date passed would be a
severe and unexplainable product failure.

### 2.1 The fraud asymmetry

Fraud pressure runs in exactly one direction, and this is a genuine stroke of luck:

| Claimed status | Reachable pool |
|---|---|
| Medical | All non-medical users + all distant medical users |
| Non-medical | Medical users only |

Claiming *medical* strictly widens your reach. Claiming *non-medical* strictly narrows it.
Nobody has a reason to falsely claim to be a non-medical student.

**Therefore: verify the medical claim hard; do not verify the non-medical claim at all.**
A non-medical user's declared institution is self-reported and is used only for optional
same-institution hiding (§4.3) — it gates nothing, so it does not need to be trustworthy.

This asymmetry is worth defending in the design. It means the entire trust burden of the
product sits on one review pipeline that can be staffed, measured, and improved.

---

## 3. `distant(campusA, campusB)` — the distance test

### 3.1 The unit is the campus, not the institution

Nigerian universities are frequently **split across sites**: preclinical years on a main
campus, clinical years at a teaching hospital that may be in a different city or state
entirely. AE-FUNAI is itself an example of this pattern.

Using `institution_id` as the unit would therefore be wrong in both directions — it would
treat two students on genuinely distant sites of one university as "same school," and it
would miss the fact that what actually determines whether two people meet is *where they
physically are*.

**The unit of comparison is the campus a student currently attends.**

### 3.2 It is not really about kilometres

The rule exists to prevent matches between people whose social graphs overlap — who will
run into each other on ward rounds, in exam halls, at inter-faculty events, or through
mutual friends. Raw distance is a proxy for that, and an imperfect one. Two medical schools
in the same city share teaching hospitals, examiners, and social circuits regardless of the
few kilometres between them.

So `distant()` is a **policy with several tiers**, all of which must pass:

| Test | Blocked when | Rationale |
|---|---|---|
| Same campus | `a.campus_id = b.campus_id` | Direct classmates |
| Same institution | `a.institution_id = b.institution_id` | Same cohort, same exams, shared administration |
| Same city | same city **and** same state | Shared social circuit |
| Shared teaching hospital | any hospital in common | They will meet on the wards — the non-obvious case, and the reason this field exists |
| Below distance floor | `distance < policy.min_distance_m` | Default **150 km**, server-tunable |

`distant()` returns true only if **every** test passes.

### 3.3 Make the threshold configuration, not code

`min_distance_m` lives in a server-side policy table, not in the app binary. The right value
is unknowable before launch and will need tuning once there is real data on how thin the
decks get. Shipping an app update to change a number would be a self-inflicted wound.

Users may **widen** the radius beyond the policy floor as a preference. They may never
narrow it below the floor.

---

## 4. Discretion: the rule governs discovery, not just matching

**This is the section most likely to be under-implemented, and the one the product lives or
dies on.**

The reason the matching rule exists is that dating within your own medical school is socially
expensive — small cohorts, fast gossip, and reputational consequences that follow you into a
clinical career. A user's real question is not *"will the app match me with my classmate?"*
It is **"could my classmate ever find out I am on this app?"**

If a same-campus classmate can *see* a profile, the app has already failed, even if it would
have refused the match. Blocking at match time is worthless.

### 4.1 The hard guarantee

> If `eligible(A, B)` is false, then A and B are **mutually invisible** everywhere in the
> product.

"Everywhere" is exhaustive and includes:

- the discovery deck
- search and any filter, present or future
- "who liked you" lists **and their counts**
- boosts, super-likes, and every premium surface
- recommendations, "people you may know," and any future social feature
- shared-friends or mutual-contact features — **these must not be built at all**, since they
  leak by construction

No premium tier may purchase visibility. There is no admin "just this once" override. If a
future feature cannot honour this guarantee, the feature does not ship.

### 4.2 Counter and metadata leaks

Filtering the list but not the count is a real leak. If a user sees "12 people liked you" but
only 9 are visible, the difference is information about who is on the app.

**Every count, badge, and aggregate must be computed after eligibility filtering, not
before.** This applies to like counts, match counts, "new people nearby" figures, and any
analytics surfaced to users.

Related leak vectors to close:

- **Distance display** — bucket it ("50+ km away"), never show precise distance
- **Push notification content** — no names or photos on the lock screen by default
- **Last-active timestamps** — coarse buckets only
- **Screenshots** — cannot be reliably prevented on either platform. Do not promise
  otherwise; set expectations honestly in onboarding instead.

### 4.3 Additional discretion layers

Beyond the invariant, users get two opt-in protections:

- **Contact blocking** — hide from anyone in the user's phone contacts. Standard practice
  and directly on-point for this audience.
- **Institution hiding** — an opt-in toggle to become invisible to *everyone* at your
  institution, medical or not.

The second exists because the stated rule permits a medical student to match a non-medical
student at their own university (§5, row 3). That is what was specified, and the spec is
followed — but the anti-gossip logic arguably applies to that case too. Making it a user
preference rather than a hard rule keeps the specified behaviour as the default while giving
cautious users a way out. See `open-questions.md` §2.

---

## 5. Truth table

`med` is the *effective* value from §2 (verified and unexpired), not the claim.

| # | A | B | Campus relationship | Eligible | Governing clause |
|---|---|---|---|---|---|
| 1 | non-med | non-med | any | **No** | (1) — no medical student in pair |
| 2 | non-med | non-med | distant | **No** | (1) — distance is irrelevant here |
| 3 | med | non-med | same campus | **Yes** | (2) vacuous; see §4.3 opt-out |
| 4 | med | non-med | same institution | **Yes** | (2) vacuous |
| 5 | med | non-med | same city | **Yes** | (2) vacuous |
| 6 | med | non-med | distant | **Yes** | both clauses satisfied |
| 7 | med | med | same campus | **No** | (2) — `distant` false |
| 8 | med | med | same institution, different campus | **No** | (2) — same-institution test |
| 9 | med | med | different institution, same city | **No** | (2) — same-city test |
| 10 | med | med | different institution, shared teaching hospital | **No** | (2) — hospital test |
| 11 | med | med | different city, < 150 km | **No** | (2) — below distance floor |
| 12 | med | med | different city, ≥ 150 km, no shared hospital | **Yes** | both clauses satisfied |
| 13 | med (claimed, pending) | non-med | any | **No** | §2 — pending counts as non-med, so row 1 applies |
| 14 | med (expired) | med (verified) | distant | **No** | §2 — expired counts as non-med, so row 1 applies |

Rows 13 and 14 are the ones most likely to be missed in implementation. Both reduce to
row 1 because the unverified party is effectively non-medical.

**Coverage check:** every combination of (A medical?, B medical?, campus relationship) has
exactly one defined outcome. No row permits non-medical × non-medical, and no row permits
medical × medical on the same campus, in the same institution, in the same city, or sharing
a hospital.

---

## 6. Edge cases

| Case | Ruling |
|---|---|
| **Verification pending** | Treated as non-medical until verified (§2). No partial credit. |
| **Verification expired** | Reverts to non-medical for discovery. Existing matches grandfathered. |
| **Verification revoked for fraud** | Immediate revert **and** existing matches suspended — unlike expiry, this is not a benign lapse. Counterparties notified that the other user's status could not be confirmed. |
| **Student transfers institution** | Must re-verify. Discovery recomputes against the new campus. Existing matches grandfathered. |
| **Intercalating student** (MBBS student doing a BSc year) | Still medical. Status follows programme enrolment, not current-year activity. |
| **Dual-degree student** | Medical if enrolled in the medical programme at all. |
| **Clinical rotation at a distant hospital** | Campus assignment should follow the student's *current posting* where known. Rotations are transient; re-deriving eligibility on every rotation is likely more churn than it is worth. Flagged in `open-questions.md`. |
| **Graduated doctor** | Out of scope — this is a student product. Offboard, or build an alumni tier later. |
| **Non-medical student at a university with no medical faculty** | Fine. Non-medical institution data gates nothing. |
| **User declines to state an institution** | Permitted for non-medical users. Required for medical users (verification supplies it). |
| **Two campuses of different institutions on one shared site** | Shared-teaching-hospital test catches the common version. Genuinely co-located campuses need a manual `same_social_zone` link — a rare enough case to handle by data entry rather than by rule. |

---

## 7. Testing requirements

The predicate must ship with tests covering, at minimum:

1. **All 14 truth-table rows**, asserted in both argument orders to prove symmetry.
2. **Discovery filtering**, not just match creation — assert that an ineligible profile never
   appears in the deck, in search, or in "who liked you".
3. **Count correctness** — assert that a "likes you" count computed over a set containing
   ineligible users matches the filtered list length (§4.2).
4. **Premium bypass attempts** — assert that boost, super-like, and any premium surface
   still filter.
5. **Direct API access** — assert that a hand-crafted request naming an ineligible user ID
   is rejected server-side, not merely absent from the client's list.
6. **Status transitions** — pending → verified → expired → re-verified, asserting discovery
   changes at each step and that existing matches survive expiry.
7. **Policy tuning** — assert that changing `min_distance_m` changes outcomes without a
   code change.
8. **Missing campus data** — assert that a medical user and a non-medical user with **no
   campus set** are eligible. Non-medical users are not required to state an institution, so
   this is a common real case, and a null-handling mistake in the predicate fails it closed —
   silently hiding profiles that should be visible. See `data-model.md` §4.

Test 5 is the one that matters most. Tests 1–4 verify the app behaves; test 5 verifies the
*server* enforces, which is the only thing an adversary cannot route around.
