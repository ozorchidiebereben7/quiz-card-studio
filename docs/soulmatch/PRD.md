# SoulMatch — Product Requirements Document

**Version:** 2.0 · **Date:** 31 July 2026 · **Status:** Draft for review
**Supersedes:** v1.0, 31 July 2026 (preserved verbatim in Appendix A)

---

## 1. Summary

SoulMatch is a dating app for university students, built around one unusual rule: **every
match must include a verified medical student, and two medical students may only match if
their campuses are far apart.**

The rule is not a gimmick. It exists because dating inside your own medical school is
socially expensive — small cohorts, shared wards, shared exams, and gossip that travels fast
and follows you into a clinical career. Medical students are told to build a social life and
then handed the one environment in which doing so is riskiest.

SoulMatch's actual promise is therefore **not better matching. It is discretion**: nobody
from your school will ever see you here.

**Launch:** Nigeria-first, beginning with a campus pilot anchored on AEFUMSA, expanding to
two or three distant medical schools before national rollout.

---

## 2. What changed from v1.0, and why

v1.0 was a sound outline, but it was a feature list rather than a decision document. Six
substantive changes:

| # | Change | Reason |
|---|---|---|
| 1 | The three matching cases restated as **one invariant**, specified formally | Three cases invite three code paths, and three code paths mean three places to get the product's defining rule wrong |
| 2 | Exclusion moved from **matching to discovery** | If a classmate can *see* you, the app has failed at the thing that motivated it — blocking at match time is worthless |
| 3 | **Marketplace structure** addressed explicitly | Every match consumes a medical student; that is a hard supply cap on the entire system and v1.0 did not acknowledge it |
| 4 | Stripe replaced with **Apple IAP + Google Play Billing + Paystack (web)** | Stripe does not support Nigerian entities, and both app stores mandate their own billing for subscriptions regardless |
| 5 | "Encrypted messaging" restated honestly | True end-to-end encryption and content moderation are mutually exclusive; claiming both would be a trust failure |
| 6 | MVP scope cut from **"every WhatsApp feature"** to text, voice notes and images | WhatsApp is fifteen years and hundreds of engineers; treating it as MVP scope would sink the project |

Nothing from v1.0 has been silently dropped. See §15 for full traceability.

---

## 3. Problem

**For medical students.** Clinical training is socially isolating: long hours, a cohort of a
few hundred that will follow you through your entire career, and a professional culture in
which private life becomes public quickly. Dating within that cohort risks not just
embarrassment but reputational damage that persists into housemanship and residency. Dating
outside it requires meeting people you have no time to meet.

**For other students.** Medical students are a genuinely attractive, hard-to-reach group, and
there is no context in which the two populations naturally mix.

**For everyone.** General dating apps are crowded, low-trust, and full of unverified accounts.
Verification is where they are weakest, and it is precisely what this audience needs most.

---

## 4. Users

| | **Verified medical student** | **Non-medical student** |
|---|---|---|
| Size | Small, fixed, hard to grow | Large, elastic |
| Role | The scarce, **mandatory** side | The abundant side |
| Motivation | Meet people outside a claustrophobic cohort, without being seen | Meet medical students |
| Fear | "Someone from my class finds out" | "The app is empty" |
| Reach | Non-medical users anywhere + distant medical users | Medical users only |
| Verification | **Rigorous** — ID card, matric number, association vouching | None required |
| Price | **Free premium, permanently** | Revenue base |

That asymmetry is the strategic core of the product and drives §6, §7, and §8.

---

## 5. The rule

Full specification in **[`eligibility-rules.md`](./eligibility-rules.md)**. Summary:

```
eligible(A, B) :=
      (med(A) OR med(B))
  AND (NOT (med(A) AND med(B)) OR distant(A.campus, B.campus))
```

Three properties the implementation must preserve:

**`med()` means verified, not claimed.** A pending or expired verification counts as
non-medical. There is no partial credit and no value in swiping while a claim is under
review.

**`distant()` is about social overlap, not kilometres.** The unit is the *campus*, not the
institution — Nigerian universities are routinely split across sites, with preclinical and
clinical years in different cities. Two campuses are distant only if they differ in
institution, differ in city, share no teaching hospital, and exceed a distance floor
(default 150 km, tunable server-side without an app release).

The shared-teaching-hospital test is the non-obvious one and the most important: two medical
students from different universities who rotate through the same hospital *will* meet on the
wards, whatever the distance between their campuses.

**It governs discovery, not matching.** If two users are ineligible, they are mutually
invisible in the deck, in search, in "who liked you" — **and in every count**. A filtered
list behind an unfiltered counter still leaks who is on the app.

### 5.1 The fraud asymmetry

Claiming *medical* strictly widens your reach; claiming *non-medical* strictly narrows it.
Nobody has any reason to falsely claim to be a non-medical student.

So the entire trust burden of the product sits on **one review pipeline**, which can be
staffed, measured, and improved. Verify the medical claim hard; do not verify the
non-medical claim at all. A non-medical user's stated institution gates nothing, so it does
not need to be trustworthy.

---

## 6. Marketplace strategy

**Every match consumes a medical student.** Non-medical demand is effectively unbounded;
medical supply is not. Left alone, this produces empty decks for non-medical users and
immediate churn — and a dating app that churns its first cohort rarely gets a second.

This is the same structural problem gendered dating apps solve with ratio management, applied
to a medical/non-medical axis. The playbook transfers:

1. **Seed supply first.** Recruit medical students on pilot campuses *before* non-medical
   signup opens. A medical student who arrives to an empty app will not return.
2. **Gate demand through supply.** Verified medical students receive invite codes for
   non-medical students. Non-medical users without a code join a **regional waitlist**,
   released as medical density supports them.
3. **Invites create the growth loop.** The scarce side controls admission, which makes
   membership feel earned and makes recruitment self-propelling.
4. **Monetise the abundant side.** Medical students get premium free, permanently.
   Non-medical students are the revenue base — they are the ones with unmet demand.
5. **Gate expansion on a liquidity metric.** Track verified-medical DAU ÷ non-medical DAU
   per region. Below the floor, no further waitlist releases in that region — regardless of
   growth targets.

Invite quota per issuer and the liquidity floor are both server-side configuration, tunable
alongside the distance threshold. All three are levers on the same problem.

---

## 7. Verification

If medical status is fakeable, the rule is decoration and the promise in §1 is a lie. This
is the highest-risk system in the product.

**Ladder, strongest first:**

| Method | Notes |
|---|---|
| Institutional email OTP | Strongest where available, but unreliable in Nigeria — many universities do not issue per-student addresses |
| **ID card + matric number + selfie liveness → human review** | The realistic primary path |
| **Association vouching** | AEFUMSA and peer associations confirm membership. Strongest signal available and the fastest to operate |
| Annual re-verification | Students graduate; status must expire, not persist |

**AEFUMSA is a strategic asset, not just a channel.** An existing relationship with a medical
students' association gives, in one partnership: a verification authority, a pilot user base,
a recruitment channel, and credibility with the exact audience whose trust is hardest to
earn. The pilot should be designed around it. Partnership terms are an open question (§16).

**Handling of evidence.** ID cards and selfies are sensitive personal data. They are stored
in a private bucket, visible only to reviewers, and **deleted when review completes**. What
persists is the outcome, the reviewer, the timestamp, and a hash — enough to detect
resubmission of a rejected document without retaining the document. See §10.

**Review SLA.** Target under 24 hours. Verification latency is the first real experience a
medical student has of the product, and they are the side that cannot be re-acquired.

---

## 8. Payments

**v1.0 specified Stripe. This does not work, for two independent reasons.**

**Stripe does not support Nigerian entities.** Stripe operates in 46 countries and Nigeria
is not among them; a Nigerian business cannot onboard directly.
([Stripe global availability](https://stripe.com/global))

**Even if it did, it would be prohibited in-app.** Both Apple and Google require their own
billing systems for digital subscriptions, and dating subscriptions are squarely in scope.
Apps may not steer users to alternative payment methods inside the app.
([Google Play payments policy](https://support.google.com/googleplay/android-developer/answer/10281818))

**Design:**

| Surface | Provider | Notes |
|---|---|---|
| iOS in-app | Apple In-App Purchase | Mandatory |
| Android in-app | Google Play Billing | Mandatory; supports NGN |
| Web checkout | **Paystack** (a Stripe company operating in Nigeria) or Flutterwave | The only place local rails are permitted |
| Entitlements | RevenueCat | One source of truth across three providers |

Store commission is 30%, reduced to 15% under $1M annual revenue — which is where this
product will sit for the foreseeable future. **Price the student market against the 15%
figure, not the 30% one.**

Pricing itself is unresolved: Nigerian students have limited disposable income, and monthly
subscriptions may convert worse than one-off boosts and Super Likes. See §16.

---

## 9. Non-functional requirements

### 9.1 Performance

Assume constrained mobile networks as the default, not the exception: offline-tolerant
message queueing, aggressive image compression, deck prefetching, and a data-saver mode.
Voice notes must upload reliably on intermittent connections — that means chunked, resumable
uploads, not a single POST.

### 9.2 Encryption — stated honestly

v1.0 promised "encrypted messaging" alongside content moderation. **These are mutually
exclusive.** If messages are end-to-end encrypted, moderators cannot read reported
conversations, and harassment reports become unactionable. For an app whose users face
career-relevant reputational risk, unactionable harassment reports are not acceptable.

**Therefore:** TLS in transit, encryption at rest, and moderator access **scoped strictly to
conversations attached to an open report**. Every such access is logged and auditable.

This is stated plainly in onboarding and the privacy policy. Overclaiming E2EE and being
found out would destroy exactly the trust the product is built on.

### 9.3 Discretion guarantees

Beyond the invariant: bucketed distance display ("50+ km away", never precise), coarse
last-active times, no names or photos in lock-screen notifications by default, contact
blocking on by default, and an opt-in "hide me from everyone at my institution" toggle.

Screenshots cannot be reliably prevented on either platform. **Say so during onboarding**
rather than implying protection that does not exist.

### 9.4 Availability

99.5% target for the pilot. Note that a dating app's load is spiky and evening-heavy;
capacity planning should target the peak, not the mean.

---

## 10. Safety, legal and compliance

> Flagged for qualified legal review. The following identifies obligations; it is not legal
> advice and should not be relied on as such.

**Data protection.** The **Nigeria Data Protection Act 2023** governs this product. Handling
student ID cards, selfies, and dating preferences is sensitive processing. Obligations to
review with counsel: registration with the NDPC (likely, at scale), designation of a Data
Protection Officer, a lawful basis for each processing purpose, documented retention limits,
and honouring erasure requests. The evidence-deletion rule in §7 exists for this reason.

**Age.** 18+ is a hard gate enforced as a database constraint, checked at signup and again at
verification. This will reject genuine students — many Nigerian medical students matriculate
at 16–17 — and that is intended.

**Store requirements.** Both stores impose specific obligations on dating and user-generated
content apps: in-app reporting, blocking, a published moderation policy, and a documented
response process. Apple's UGC rules (Guideline 1.2) require all of these before review will
pass. Build them into the MVP; they are not v2 features.

**Safety tooling (MVP).** Report, block, unmatch, photo moderation on upload, a rate limiter
on new matches to blunt spam, and a documented escalation path for threats or sextortion.

**Risk register:**

| Risk | Severity | Mitigation |
|---|---|---|
| Fake medical accounts | **Critical** — voids the entire premise | Human review, association vouching, annual expiry, revocation with match suspension |
| Non-medical users see empty decks | **Critical** — kills retention | Med-first seeding, invite gating, regional liquidity floor (§6) |
| Discretion breach (a classmate sees a profile) | **Critical** — destroys the core promise | Server-side RLS enforcement, filtered counts, no bypass at any tier, explicit test coverage |
| Harassment, sextortion, image leaks | High — career-relevant for this audience | Scoped moderation access, fast escalation, honest screenshot expectations |
| Payment rails misconfigured or rejected at review | High | Store billing in-app from day one; Paystack confined to web |
| NDPA non-compliance | High | Counsel review before launch; retention limits built in from the start |
| Small-market gossip defeats the distance rule | Medium | Shared-hospital test; tunable threshold; institution-hiding opt-in |

---

## 11. Technology stack

v1.0 specified React Native + Firebase/Firestore. **The frontend stays; the backend
changes.**

| Layer | v1.0 | v2 |
|---|---|---|
| Mobile | React Native | **Expo** (React Native) — managed workflow, OTA updates |
| Backend / DB | Firebase / Firestore | **Supabase** (Postgres + PostGIS) |
| Auth | Firebase Auth | Supabase Auth, phone OTP |
| Storage | Firebase Storage | Supabase Storage, private buckets for verification evidence |
| Realtime chat | Firestore listeners | Supabase Realtime |
| Push | FCM | **FCM retained** — works fine independently |
| Payments | Stripe | Apple IAP + Google Play Billing + Paystack (web), unified by RevenueCat (§8) |

**The eligibility rule is the reason.** It is a relational constraint spanning two profiles,
their campuses, those campuses' institutions, a hospital join table, a geographic distance,
and a policy row. In Postgres that is one function guarded by one row-level security policy.
Firestore security rules cannot join, cannot compute geographic distance, and can read only a
few documents — so the Firestore version means denormalising campus, institution, city,
hospital list, and coordinates onto every profile *and every swipe*, enforcing the rule in
Cloud Functions, and keeping all those copies consistent forever. The product's defining
invariant would live in application code in several places instead of in one database
function.

Row-level security also gives something Cloud Functions do not: a hand-crafted API request
naming an ineligible profile returns nothing, because the row is not visible to that session.
Enforcement sits below the application, where it cannot be forgotten.

**Costs, stated honestly:** Supabase has a smaller ecosystem than Firebase, fewer turnkey
mobile conveniences, and requires comfort with SQL. For a product whose correctness story is
one relational predicate, that is a good trade. Full rationale and schema in
[`data-model.md`](./data-model.md).

---

## 12. Scope

### MVP — pilot

Auth (phone OTP), profile creation with photos, **medical verification pipeline + reviewer
tooling**, invite codes and waitlist, the eligibility engine with discovery filtering, swipe
deck, matching, chat (**text, voice notes, images**, reply-to, typing, read receipts), push
notifications, report/block/unmatch, and an admin dashboard covering users, verification
queue, reports, and the liquidity metric.

The verification pipeline and the eligibility engine are the MVP. Everything else is
supporting structure.

### v1.1 — after pilot validation

Premium tier and payments, boosts and Super Likes, richer discovery filters, profile prompts,
voice intros, improved onboarding.

### v2 and beyond

Video profiles, in-app video dates, AI-assisted matching, events and meetups, travel mode,
alumni tier for graduating students.

### Explicitly deferred, with reasons

| Deferred | Reason |
|---|---|
| Voice and video **calls** | Large build; voice notes cover the need at a fraction of the cost |
| Group chats | No product rationale in a 1:1 dating context |
| Status/stories, disappearing media | Scope inflation; conflicts with moderation |
| End-to-end encryption | Incompatible with moderation (§9.2) |
| Shared-friends / mutual-contacts features | **Leaks by construction** — must never be built |
| Web app | Mobile-first audience; store billing is mobile anyway |

---

## 13. Launch plan

v1.0's plan — "build MVP, test, beta launch, Android, iOS, marketing" — is a generic software
sequence. It does not account for the fact that this marketplace must be seeded in a specific
order or it does not work at all.

| Phase | Goal | Exit criteria |
|---|---|---|
| **0. Partnership** | Secure AEFUMSA as verification partner and pilot base | Terms agreed; verification process defined with the association |
| **1. Build** | MVP (§12), verification pipeline first | Eligibility test suite green, including server-side enforcement tests |
| **2. Closed alpha** | ~50 verified medical students, one campus, **no non-medical users at all** | Verification latency < 24 h; discovery filtering confirmed correct in production |
| **3. Supply seeding** | Recruit medical students at 2–3 *distant* campuses | Enough medical density that med × med decks are non-empty |
| **4. Invite beta** | Open invite codes; non-medical users enter through medical students | Liquidity ratio above floor; week-4 retention healthy **on both sides** |
| **5. Regional rollout** | Release waitlist by region, gated on the liquidity metric | Ratio holds as volume grows |
| **6. Public launch** | Android first (dominant in Nigeria), iOS shortly after | Store review passed, including UGC requirements (§10) |

**Phase 3 is the one that gets skipped under pressure and must not be.** Medical students at
a single campus can only match non-medical users — the med × med half of the product does not
exist until a second distant campus is seeded. Launching without it ships half the product
and tests the wrong hypothesis.

Android leads on iOS because Android dominates the Nigerian student market by a wide margin.

---

## 14. Success metrics

v1.0 proposed registrations, DAU, MAU, and session duration. These are vanity metrics, and
**session duration is actively the wrong goal** — a dating app succeeds when people leave it
to meet each other.

**North star:** *mutual conversations reaching 20+ messages across 3+ days.* A real
connection, not a match count.

**Health metrics:**

| Metric | Why | Pilot target |
|---|---|---|
| Regional liquidity ratio (verified-med DAU ÷ non-med DAU) | The one number that predicts marketplace collapse | Above floor in every active region |
| Verification pass rate and median review latency | Verification is the trust backbone | > 80% pass, < 24 h |
| Time to first match, by side | Detects the empty-deck failure early | < 48 h, both sides |
| Reports per 1,000 matches | Safety trend | Monitored, no target |
| Week-4 retention, by side | Retention split by side, never averaged — an average hides the collapse of the abundant side | Tracked separately |
| **Discretion incidents** | Any report of a same-campus profile appearing | **Zero. Treated as a Sev-1 defect.** |

---

## 15. Traceability from v1.0

Every section of v1.0 accounted for — nothing silently dropped:

| v1.0 item | v2 disposition |
|---|---|
| §3 Goals | Retained, plus an explicit discretion goal — the one that actually differentiates the product |
| §4 Target audience: "18+ worldwide" | Narrowed to **Nigerian students, 18+**, pilot-first (§13). "Worldwide" was not a strategy |
| §5 Success metrics | Rewritten (§14); session duration dropped as an anti-goal |
| §8 Non-functional requirements | Expanded (§9); "encrypted messaging" corrected (§9.2) |
| §9 Technology stack | Frontend retained; backend moved Firebase → Supabase with rationale (§11) |
| §14 Launch plan | Rewritten as a supply-seeded sequence (§13) |
| §15 Vision statement | Retained, narrowed: most trusted platform **for students**, starting in Nigeria |
| Authentication | MVP (§11) |
| User profiles | MVP |
| Discovery / swiping | MVP — now governed by the eligibility engine |
| Matching | MVP — now defined by the formal invariant (§5) |
| Chat | MVP, scoped to text/voice/images (§11) |
| Notifications | MVP, with discretion constraints (§9.3) |
| Safety tools | MVP, expanded (§10) |
| Premium features | v1.1 — deliberately after liquidity is proven |
| Admin: users, reports, verification, analytics, subscriptions, moderation | MVP, less subscriptions (moves to v1.1 with premium) |
| MVP: registration, login, profile, photo upload, swipe, chat, notifications, editing, reporting, admin | All retained; **verification, invites and eligibility engine added** as MVP-critical |
| Roadmap: video profiles, voice intros, AI matching, video dates, events, AI coach, travel mode | v2 (§11); **voice intros promoted to v1.1** as low-cost and well-suited to the audience |
| Business model: freemium, subscriptions, boosts, Super Likes, ads | Retained, less **ads** — ad load on a discretion-focused product undermines the premise, and student-market ad revenue would be negligible |

---

## 16. Open questions

Decisions requiring the founder or outside expertise are tracked separately in
**[`open-questions.md`](./open-questions.md)**. The blocking ones:

1. **Brand** — "SoulMatch" and "SoulMate" are both crowded names in dating. Trademark search
   needed before any brand investment.
2. **Same-institution medical × non-medical** — currently permitted as specified, but the
   anti-gossip logic arguably applies. Handled as an opt-in toggle pending a decision.
3. **Pricing** — subscription vs. consumable-led, against a low-disposable-income market.
4. **Moderation staffing** — who reviews verifications and reports at pilot scale, and what it
   costs.
5. **AEFUMSA partnership terms** — verification authority, data sharing, endorsement.

---

## 17. Related documents

| Document | Contents |
|---|---|
| [`eligibility-rules.md`](./eligibility-rules.md) | The invariant, distance policy, discretion guarantees, truth table, edge cases, test requirements |
| [`data-model.md`](./data-model.md) | Postgres schema, the eligibility predicate as SQL, RLS enforcement |
| [`open-questions.md`](./open-questions.md) | Unresolved decisions with options and recommendations |

---

## Appendix A — PRD v1.0, verbatim

> Preserved unchanged for comparison.

```
SoulMatch Product Requirements Document (PRD)
Version: 1.0
Date: July 31, 2026

1. Product Vision
SoulMatch is a modern dating application that helps people discover meaningful relationships
through a simple, secure, and enjoyable matching experience.

2. Problem Statement
Many dating apps are crowded, unsafe, or difficult to use. Users need a platform that
prioritizes genuine connections, safety, and an intuitive experience.

3. Goals
- Help users find compatible matches.
- Create a fast user experience.
- Ensure safety through moderation and verification.
- Build a scalable platform.
- Generate recurring revenue through premium subscriptions.

4. Target Audience
Adults 18+ seeking friendships, dating, or long-term relationships worldwide.

5. Success Metrics
Registrations, DAU, MAU, match rate, messages exchanged, retention, premium conversion,
session duration.

6. Core Features
Authentication, user profiles, discovery/swiping, matching, chat, notifications, safety
tools, premium features.

7. Admin Dashboard
Manage users, reports, verification, analytics, subscriptions, moderation.

8. Non-Functional Requirements
Fast, secure, responsive, cloud storage, encrypted messaging, high availability.

9. Technology Stack
Frontend: React Native
Backend: Firebase
Database: Firestore
Storage: Firebase Storage
Notifications: Firebase Cloud Messaging
Payments: Stripe, Google Play Billing, Apple In-App Purchases

10. MVP Scope
Registration, login, profile creation, photo upload, swipe matching, chat, notifications,
profile editing, reporting, admin dashboard.

11. Future Roadmap
Video profiles, voice intros, AI matching, video dates, events, AI dating coach, travel mode.

12. Business Model
Freemium, subscriptions, boosts, Super Likes, optional ads.

13. Risks
Fake profiles, spam, harassment, privacy, fraud, moderation.

14. Launch Plan
Build MVP, test, beta launch, Android, iOS, marketing, continuous updates.

15. Vision Statement
Become one of the world's most trusted dating platforms.
```
