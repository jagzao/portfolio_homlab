# Analysis → Deliver Contract

Status: ACTIVE TEAM RULE
Owner: Juan
External Auditor: ChatGPT
Last updated: 2026-09-04

## Purpose

When Juan and the External Auditor finish an analysis/refinement and Juan asks for the **deliver** (for example: `genera el deliver`, `crea la US`, `prepara el deliver`, or equivalent), the analysis must be converted into one complete, durable, implementation-ready User Story/spec in the repository. Do not answer with a mega prompt that re-explains the project; durable repo memory/specs are the source of execution context.

## Required deliver

The External Auditor must create or update the canonical `docs/specs/US-XXX-*.md` (or a `BUG-XXX` spec when the work is strictly a defect) so that **everything materially agreed or discovered in the analysis is captured**. Do not silently omit findings, edge cases, UI/UX behavior, technical constraints, security boundaries, risks, performance requirements, or validation expectations.

Every deliver must include, when applicable:

- User Story and product value;
- analysis context and decisions made;
- scope and explicit out-of-scope;
- observable/testable Acceptance Criteria;
- UX, visual and responsive requirements;
- technical/architecture constraints and ADR dependencies;
- data/publication requirements;
- security/privacy requirements;
- accessibility requirements;
- performance/budget requirements;
- dependencies, risks, migration/rollback concerns;
- implementation notes sufficient for `project-lead` to plan without reconstructing chat history;
- complete test/validation matrix;
- Definition of Done and audit handoff requirements.

## Mandatory test matrix

A deliver is not complete unless it explicitly covers each layer below as **REQUIRED** or explains why it is **N/A** for that story:

1. Unit tests (UT) for logic with business/technical value.
2. Integration tests for boundaries/contracts where applicable.
3. Smoke tests for the minimal critical startup/health path.
4. E2E tests for the complete user-critical path and important variants.
5. Regression tests for every bug/finding fixed during implementation or review.
6. Security/privacy tests, including trust-boundary/secret/public-content checks where applicable.
7. Accessibility tests/keyboard/reduced-motion/semantic fallback where UI is involved.
8. Visual validation with real rendered evidence for UI/3D work.
9. Performance validation against accepted budgets when runtime/performance can be affected.
10. Build, lint, typecheck and static validation applicable to the stack.

Passing test counts alone are insufficient. Tests must exercise the actual accepted behavior and important failure/recovery paths.

## End-to-end project-lead execution loop

Once Juan accepts the deliver, `project-lead` owns the work from start to audit-ready completion. It must continue for as long as needed inside the accepted scope; there is no artificial time limit or partial-success shortcut.

Required loop:

`READ SPEC/MEMORY → PLAN → DELEGATE/IMPLEMENT → TARGETED TESTS → BUILD/LINT/TYPECHECK → RUN → SMOKE → E2E → REGRESSION → SECURITY → ACCESSIBILITY → VISUAL INSPECTION → PERFORMANCE MEASURE → INDEPENDENT REVIEW → FIX → RETEST → FULL RELEVANT VALIDATION → HANDOFF → PR → EXTERNAL AUDIT`

Repeat `FIX → RETEST → REVIEW` until the accepted AC/DoD are satisfied or a genuine human/access/security/cost gate blocks progress.

Do not mark `IMPLEMENTED`, `PASS`, or `DONE` merely because code compiles or most tests pass. A known accepted-criteria failure, unmeasured mandatory gate, BLOCKER/P0, or inaccessible audit evidence prevents completion unless Juan explicitly changes the accepted spec.

## Auditability requirement

For UI/3D and other evidence-heavy work, the final handoff must make External Audit independently possible. Provide durable/reproducible evidence, not session-only claims:

- unmerged PR and exact head SHA;
- exact validation commands/results;
- CI/status evidence when configured/required;
- real screenshots/video/preview or reproducible artifacts accessible to the External Auditor;
- performance measurements and methodology;
- independent reviewer findings and fixes;
- security/public-content evidence;
- known issues and spec deviations;
- placeholders explicitly identified;
- public professional claims with approved provenance when applicable.

If evidence is not accessible to the External Auditor, the corresponding audit gate is not complete.

## How Juan asks the agent to execute

After the durable deliver is created and ACCEPTED, Juan should **not** send a mega prompt. The normal instruction is intentionally short:

> Ejecuta `project-lead` y completa el deliver activo de inicio a fin según la spec, memory y backlog del repo. Ejecuta todo el loop de validación y no pares hasta `READY FOR EXTERNAL AUDIT`, salvo un gate humano real.

`project-lead` must resolve the active accepted spec from the repository, read canonical memory/ADRs, and execute the complete scope. If more than one accepted deliver is active, Juan should name only the US/BUG id; the rest of the context remains in Git.

## External Auditor responsibility

When Juan asks the External Auditor to `generar el deliver`, the External Auditor must materialize the complete spec in Git first, then tell Juan the short execution instruction above (optionally including the US/BUG id). Do not replace durable SDD with a large transient prompt.
