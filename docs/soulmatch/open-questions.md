# SoulMatch — Open Questions

**Version:** 2.0 · **Date:** 31 July 2026

Decisions that need the founder, a partner, or outside expertise. Each has a recommendation,
but none should be treated as settled.

---

## 1. Brand and name

**Question:** Is "SoulMatch" the name?

Both "SoulMatch" and "SoulMate" are crowded in the dating category — multiple existing apps,
services, and domains use variations. This creates three risks: trademark conflict, poor app
store search ranking against incumbents, and wasted spend if a rebrand is needed later.

**Recommendation:** Run a trademark search (Nigerian Trademarks Registry, plus app store and
domain availability) **before** any brand investment — logo, domain, association materials.
If it is contested, rename now. A rename costs nothing today and a great deal after launch.

Worth considering: the current name says nothing about what makes the product different. A
name that gestures at verification, discretion, or the student/medical angle would do more
work.

**Blocking:** No, but resolve before Phase 0 of the launch plan.

---

## 2. Same-institution medical × non-medical

**Question:** Should a medical student be able to match a non-medical student at their *own*
university?

As specified, yes — the rule places no distance constraint on medical × non-medical pairs,
and `eligibility-rules.md` §5 row 3 implements that faithfully.

But the reasoning behind the whole product is that dating where people know you is socially
expensive. A non-medical student on your own campus shares your canteen, your hostel block,
your social events, and quite possibly your friends. The gossip risk is lower than with a
classmate, but it is not zero — and the medical student is the one carrying the reputational
exposure.

**Options:**

| Option | Effect |
|---|---|
| **A. Keep as specified** (current) | Faithful to the stated rule; larger pool for medical users on campus |
| **B. Extend the distance rule to all pairs** | Maximum discretion; substantially shrinks every medical user's pool, and hurts the marketplace where it is already thinnest |
| **C. Opt-in toggle** (implemented) | Default is A; cautious users select B for themselves |

**Recommendation: C, already built** — `profiles.hide_from_institution`, applied symmetrically.
It keeps the specified behaviour as the default while giving the exposed party control.

Worth asking pilot users directly. If most medical students switch the toggle on, that is
strong evidence the default is wrong and B should become the rule.

**Blocking:** No — C works under either eventual answer.

---

## 3. Pricing

**Question:** What does premium cost, and is a subscription even the right shape?

Constraints: Nigerian students have limited disposable income; app store commission is 15%
below $1M revenue; card penetration among students is low, though Google Play Billing does
support NGN.

Recurring subscriptions may convert poorly with this audience. One-off consumables — boosts,
Super Likes, a week of visibility — fit both the budget pattern and the intermittent way
students actually use dating apps.

**Recommendation:** Launch **consumable-led** with a low-priced weekly or monthly option
alongside, rather than subscription-only. Instrument both and let pilot data decide. Do not
set final pricing before Phase 4 — there is no way to guess it well.

Note this only affects non-medical users. Medical students get premium free permanently
(`PRD.md` §6), so pricing decisions never touch the scarce side.

**Blocking:** No — premium is v1.1, after liquidity is proven.

---

## 4. Rotation-aware campus assignment

**Question:** Should eligibility follow a student's *current clinical rotation* rather than
their home campus?

Clinical students rotate between hospitals, sometimes in other cities. A student on a
three-month posting is physically — and socially — somewhere other than their home campus.

Arguments for: more accurate; the shared-ward risk is real and time-varying.
Arguments against: eligibility would change every few months, silently reshaping who can see
whom; students would need to keep postings updated; and it introduces churn into the one
system that most needs to be stable and predictable.

**Recommendation:** Home campus only for MVP. The shared-teaching-hospital test already
catches the main risk — if two campuses rotate through the same hospital, they are blocked
regardless of who is posted where today. Revisit only if pilot users report actual ward
encounters.

**Blocking:** No.

---

## 5. Moderation and verification staffing

**Question:** Who reviews verifications and reports, and what does it cost?

The PRD commits to a sub-24-hour verification SLA (`PRD.md` §7). At pilot scale that is
plausibly one person part-time. At national scale it is not, and the cost scales with the
scarce side of the marketplace — the side that generates no revenue.

Unresolved: who does this at pilot, whether AEFUMSA can supply trusted reviewers, what
happens to the SLA overnight and at weekends, and how reviewers are themselves vetted given
they see student IDs and selfies.

**Recommendation:** Staff the pilot with association-nominated reviewers under a written
confidentiality agreement. Instrument review time per case from day one — that number is the
input to every later scaling decision. Build reviewer action logging into the MVP admin
tooling; access to sensitive documents must be auditable from the start, not retrofitted.

**Blocking:** **Yes, partially** — MVP admin tooling cannot be scoped until the reviewer
model is decided.

---

## 6. AEFUMSA partnership terms

**Question:** What exactly is the relationship?

AEFUMSA appears in the PRD as verification authority, pilot user base, and recruitment
channel. That is a lot of dependency on an arrangement that has no stated terms.

Needs answering: Is the association endorsing the product, or merely permitting it? Does it
confirm membership on request, or supply a roster (a much larger data-protection question)?
Is there any exclusivity? What happens to verification if the relationship ends? Does the
association expect equity, revenue share, or a fee? Who is accountable if a verified user
turns out to be fraudulent?

**Recommendation:** Get it in writing before Phase 1 — including an exit clause and a
fallback verification path (ID card review) that works without the association. **Do not
build a single point of failure into the trust backbone on the strength of a friendly
relationship.**

The data-protection angle deserves particular care: a membership roster shared with a dating
app is a significant NDPA question, and confirmation-on-request is a far safer design than
bulk transfer.

**Blocking:** **Yes** — Phase 0 of the launch plan.

---

## 7. Legal review

**Question:** Who provides Nigerian data protection advice?

`PRD.md` §10 identifies NDPA 2023 obligations but is explicitly not legal advice. Someone
qualified needs to confirm NDPC registration requirements at the expected scale, whether a
DPO must be appointed, the lawful basis for processing verification documents, retention
periods, and the erasure-request process.

**Recommendation:** Engage a Nigerian data protection practitioner before Phase 2 — the
closed alpha is the first point at which real student ID documents are processed. Everything
before that is design.

**Blocking:** **Yes** — before any real user data is collected.

---

## 8. Company structure and payment rails

**Question:** What entity operates this, and where?

Follows from §8 of the PRD. Apple and Google both require a developer account tied to a legal
entity, and payouts must land somewhere. Paystack requires a Nigerian entity; some founders
incorporate in the US to access other rails, which carries its own tax and compliance
overhead.

**Recommendation:** A Nigerian entity is the straightforward answer for a Nigeria-first
product — Paystack works natively, and store billing works from Nigeria. Revisit only if
international expansion becomes concrete. Confirm with an accountant; this is outside what
this document can responsibly resolve.

**Blocking:** Before Phase 6 (public launch), not before.

---

## Summary

| # | Question | Blocking? | When |
|---|---|---|---|
| 6 | AEFUMSA partnership terms | **Yes** | Phase 0 |
| 7 | Nigerian legal review | **Yes** | Before Phase 2 |
| 5 | Moderation staffing | **Partially** | Before MVP admin scoping |
| 1 | Brand and trademark | No | Before brand spend |
| 8 | Entity and payment rails | No | Before Phase 6 |
| 2 | Same-institution med × non-med | No | Validate during pilot |
| 3 | Pricing | No | Phase 4 data |
| 4 | Rotation-aware campuses | No | Only if reported |
