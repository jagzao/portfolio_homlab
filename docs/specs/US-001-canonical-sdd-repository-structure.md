# US-001 — Canonical SDD Repository Structure

Status: `IMPLEMENTED`
Accepted by: Juan
Accepted on: 2026-08-31
Last transition: `READY → ACCEPTED` on 2026-08-31

## User Story

As a multi-agent engineering team, I want one canonical SDD repository structure, so every agent reads and writes the same durable artifacts.

## Product Value

Repository context survives sessions and runtimes.

## Refinement Gate

- Problem: conflicting document paths and implicit lifecycle.
- User: Juan, project-lead, specialists, External Auditor.
- Value: coherent durable traceability.
- Behavior: every instruction references one tree and explicit states.
- Constraints: low ceremony; no product implementation.
- Acceptance: path/reference validation passes.
- Risks: duplicated runtime instructions drift.
- Dependencies: existing foundation at `b940897`.

## Scope

Canonical tree, lifecycle, template, updated central skills.

## Out of Scope

Application, 3D, backend, cloud, CI platform automation.

## Acceptance Criteria

- [ ] One canonical structure exists in `.agents/AGENTS.md`.
- [ ] project-lead and specialist skills use it without conflicting paths.
- [ ] `docs/specs/US-TEMPLATE.md` exists.
- [ ] State is visible in every story.
- [ ] Lifecycle `DRAFT/READY/ACCEPTED/IMPLEMENTED/AUDITED/DONE` is defined.
- [ ] `ACCEPTED` means Juan approved scope and acceptance criteria.
- [ ] Meaningful implementation is blocked before `ACCEPTED`.
- [ ] Trivial low-risk maintenance exception is documented.

## Implementation Plan

Update central contract/skills; add template/specs; validate paths and references.

## Testing Requirements

Run `scripts/validate-foundation.ps1` and `git diff --check`.

## State History

| Date | From | To | Authority | Evidence |
|---|---|---|---|---|
| 2026-08-31 | — | DRAFT | project-lead | Audit finding |
| 2026-08-31 | DRAFT | READY | project-lead | Refinement gate complete |
| 2026-08-31 | READY | ACCEPTED | Juan | Foundation iteration instruction |
| 2026-09-01 | ACCEPTED | IMPLEMENTED | project-lead | Branch validation and handoff |
