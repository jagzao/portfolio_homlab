# US-003 — Git and External Audit Workflow

Status: `IMPLEMENTED`
Accepted by: Juan
Accepted on: 2026-08-31
Last transition: `READY → ACCEPTED` on 2026-08-31

## User Story

As Juan and the agent team, I want meaningful work isolated and auditable, so external review happens before accepted work enters `main`.

## Refinement Gate

- Problem: initial foundation went directly to `main`.
- User: Juan, project-lead, External Auditor.
- Value: reviewable history and controlled acceptance.
- Behavior: accepted spec through branch/PR/audit before merge.
- Constraints: simplest GitHub flow; emergency/trivial escape hatch.
- Acceptance: workflow, template, handoff, branch, and unmerged PR exist.
- Risks: bypassing gate; state marked DONE too early.
- Dependencies: GitHub repository and CLI access.

## Acceptance Criteria

- [ ] Git flow is documented.
- [ ] Meaningful work uses branches and PRs referencing US IDs.
- [ ] Direct feature/foundation pushes to `main` are prohibited.
- [ ] External audit is explicit and severity-based.
- [ ] Findings may become Bug/User Story specs.
- [ ] Handoff is durable.
- [ ] Merge eligibility requires `AUDITED` and resolved BLOCKER/P0 findings.
- [ ] Emergency/trivial exceptions preserve traceability.
- [ ] This iteration stops at PR ready; project-lead does not merge.

## Implementation Plan

Add delivery workflow, PR template, handoff; push branch and open unmerged PR.

## State History

| Date | From | To | Authority | Evidence |
|---|---|---|---|---|
| 2026-08-31 | — | DRAFT | project-lead | Audit finding |
| 2026-08-31 | DRAFT | READY | project-lead | Workflow refined |
| 2026-08-31 | READY | ACCEPTED | Juan | Foundation iteration instruction |
| 2026-09-01 | ACCEPTED | IMPLEMENTED | project-lead | Branch, validation, handoff, PR preparation |
