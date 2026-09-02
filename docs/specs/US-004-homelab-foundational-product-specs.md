# US-004 — HomeLab Foundational Product Specs

Status: `DONE`
Accepted by: Juan
Accepted on: 2026-08-31
Last transition: `AUDITED → DONE` on 2026-09-02

## User Story

As the HomeLab engineering team, I want agreed vision materialized as durable specifications, so future agents do not rediscover product context.

## Refinement Gate

- Problem: product direction lived primarily in prompts and one broad skill.
- User: Juan, agents, reviewers.
- Value: actionable, durable product and engineering decisions.
- Behavior: canonical vision/product/architecture documents govern future stories.
- Constraints: documentation only; no Three.js/backend/cloud/migrations.
- Acceptance: all ten required documents exist and cross-reference coherently.
- Risks: invented claims; premature stack lock; fake budget precision.
- Dependencies: Juan's accepted vision and private/public boundary.

## Acceptance Criteria

- [x] Four vision docs exist under `docs/vision/`.
- [x] Four architecture docs exist under `docs/architecture/`.
- [x] Software Lab and roadmap exist under `docs/product/`.
- [x] HomeLab remains living lab, not 3D CV.
- [x] Continuous world, single portal, Zavit identity, accessibility, and first flagship lab are actionable.
- [x] Second Brain project `oweqrcmxmmxzyahyleap` remains private; no migration exists.
- [x] Claims use `VERIFIED/UNVERIFIED/UNKNOWN` and publication gate.
- [x] Candidate stack remains decision candidate, not locked.
- [x] Performance budgets are numerical, `PROVISIONAL`, and testable.
- [x] US-010 is future refinement only; no 3D implementation exists.

## Implementation Plan

Write canonical product and architecture docs; cross-check claims, boundaries, paths, and future US-010 gate.

## State History

| Date | From | To | Authority | Evidence |
|---|---|---|---|---|
| 2026-08-31 | — | DRAFT | project-lead | Product brief |
| 2026-08-31 | DRAFT | READY | project-lead | Refinement gate complete |
| 2026-08-31 | READY | ACCEPTED | Juan | Foundation iteration instruction |
| 2026-09-01 | ACCEPTED | IMPLEMENTED | project-lead | Canonical product/architecture docs complete |
| 2026-09-02 | IMPLEMENTED | AUDITED | External Auditor | PR #1 review 5080741521 (CHANGES REQUIRED) resolved; re-audit PASS comments 5089914053 and 5089927962 on head `6b5a4789`, no BLOCKER/P0 remaining |
| 2026-09-02 | AUDITED | DONE | project-lead | PR #1 merged to `main` as `5e610e4` |
