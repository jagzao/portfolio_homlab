# US-XXX — Title

Status: `DRAFT`
Accepted by: —
Accepted on: —
Last transition: `DRAFT` on YYYY-MM-DD

## User Story

As a ...
I want ...
So that ...

## Product Value

## Context / Analysis Summary

Capture the material conclusions that caused this deliver to exist. Do not require a future agent to reconstruct chat history.

## Refinement Gate

- Problem:
- User:
- Value:
- Behavior:
- Constraints:
- Acceptance:
- Risks:
- Dependencies:

## Scope

## Out of Scope

## Acceptance Criteria

- [ ] AC1

## UX / Visual Requirements

## Technical / Architecture Constraints

## Data Requirements

## Security / Privacy Requirements

## Accessibility Requirements

## Performance Requirements

## Dependencies

## Risks / Rollback

## Implementation Plan

### Files / Components

### Data Flow

### Steps

## Test and Validation Matrix

Each row must be `REQUIRED` with concrete coverage or `N/A` with justification. Test counts alone are not evidence of accepted behavior.

| Layer | REQUIRED / N/A | Required coverage / evidence |
|---|---|---|
| Unit (UT) | | |
| Integration | | |
| Smoke | | |
| E2E critical path | | |
| Regression | | Every bug/review finding fixed in this deliver gets regression coverage where automatable |
| Security / privacy | | Trust boundaries, secrets, public-content/data exposure as applicable |
| Accessibility | | Keyboard, semantic fallback, reduced motion and assistive semantics as applicable |
| Visual | | Real rendered evidence for UI/3D work |
| Performance | | Accepted budgets + measurement methodology when runtime can be affected |
| Build / lint / typecheck / static | | |

## Validation Loop

`PLAN → IMPLEMENT/DELEGATE → TARGETED TESTS → BUILD/LINT/TYPECHECK → RUN → SMOKE → E2E → REGRESSION → SECURITY → ACCESSIBILITY → VISUAL → PERFORMANCE → INDEPENDENT REVIEW → FIX → RETEST → FULL RELEVANT VALIDATION → HANDOFF`

Repeat until all accepted AC/DoD are satisfied or a genuine gate blocks progress. Do not convert a FAIL/NOT MEASURED mandatory gate into PASS without an accepted spec change.

## Audit Handoff Requirements

- [ ] Unmerged PR + exact head SHA
- [ ] Exact validation commands/results
- [ ] CI/status/artifacts when configured or required
- [ ] External-auditor-accessible visual/runtime evidence when applicable
- [ ] Independent reviewer findings and fixes
- [ ] Performance methodology/results when applicable
- [ ] Security/public-content evidence when applicable
- [ ] Known issues and deviations
- [ ] Placeholders explicitly identified
- [ ] Public professional claims and approved provenance, when applicable

## Definition of Done

- [ ] Acceptance criteria satisfied
- [ ] Mandatory test matrix completed; N/A rows justified
- [ ] Smoke/E2E/regression/security coverage passes as applicable
- [ ] Build/lint/typecheck/static validation passes as applicable
- [ ] Visual/accessibility/performance gates pass as applicable
- [ ] Independent review recorded; no unresolved BLOCKER/P0
- [ ] Durable handoff and PR created
- [ ] Evidence required for External Audit is accessible/reproducible
- [ ] External audit completed before merge

## State History

| Date | From | To | Authority | Evidence |
|---|---|---|---|---|
| YYYY-MM-DD | — | DRAFT | Author | Initial draft |

Valid lifecycle: `DRAFT → READY → ACCEPTED → IMPLEMENTED → AUDITED → DONE`. Only Juan accepts scope. See `.agents/AGENTS.md` and `.agents/rules/ANALYSIS_DELIVER_CONTRACT.md`.
