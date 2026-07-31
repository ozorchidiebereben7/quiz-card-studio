# SoulMatch — Product Documentation

Product specification for **SoulMatch**, a dating app for university students built around
one rule: every match must include a verified medical student, and two medical students may
only match if their campuses are socially distant.

The rule exists because dating inside your own medical school is socially expensive — small
cohorts, shared wards, and gossip that follows you into a clinical career. The product's real
promise is therefore discretion, not matching.

## Documents

| Document | Read it for |
|---|---|
| **[PRD.md](./PRD.md)** | The main document. Vision, users, marketplace strategy, verification, payments, scope, launch plan, metrics. Start here. |
| **[eligibility-rules.md](./eligibility-rules.md)** | The matching rule specified precisely: the invariant, the distance policy, discretion guarantees, a full truth table, edge cases, and test requirements. |
| **[data-model.md](./data-model.md)** | Postgres schema, the eligibility rule as executable SQL, and row-level-security enforcement. |
| **[open-questions.md](./open-questions.md)** | Unresolved decisions, each with options and a recommendation. Two are blocking. |

## Reading order

- **Non-technical reader** (association partner, potential cofounder) — `PRD.md` §1–§8, then
  `open-questions.md`.
- **Developer** — `eligibility-rules.md` first, then `data-model.md`, then `PRD.md` §11–§12
  for stack and scope.
- **Founder** — all of `PRD.md`, then `open-questions.md`, which is where the decisions are.

## Status

Version 2.0, 31 July 2026. Draft for review — no code has been written.

v2.0 revises the original v1.0 PRD, which is preserved verbatim in `PRD.md` Appendix A so the
two can be compared. The substantive changes are listed in `PRD.md` §2, and §15 accounts for
every section of v1.0.

## Why this lives in this repository

This repository otherwise contains **AEFUMSA Quiz Card Studio**, an unrelated single-file
tool that turns medical MCQs into social media cards. The SoulMatch documents share no code
with it; they are here because this is where the work was requested.

They are deliberately self-contained in `docs/soulmatch/`, with no dependencies on anything
outside this directory, so the whole folder can be lifted into its own repository when
development begins — which is the recommended next step.
