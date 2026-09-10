# HANDOFF — M5 Architecture Table + SIMULATE FAILURE, US-010 IMPLEMENTED

Interim milestone note (M2–M9 accumulate on one branch; durable handoff/PR finalized at M9). This one also closes `US-010` itself.

## Branch

`feat/US-010-m2-application-foundation`, commits `8df2c0a` (implementation), `5376b30` (single-dialog fix + AC-gap tests), `1a4e46a` (input-block fix).

## Story

`US-010` moves `ACCEPTED → IMPLEMENTED`. Every Acceptance Criterion is checked with file/test evidence in the spec itself.

## Implemented

Architecture Table (`API → QUEUE → WORKER → CACHE → DATABASE`) with a labeled `SIMULATE FAILURE` sequence — the explicit UI Alpha minimum for the Software Engineering Lab. One component (`ArchitecturePanel.tsx`) works two ways: always available in the semantic shell, and from an overlay near the Software Lab landmark in 3D.

## Independent Review — three real bugs caught across two rounds

- **code-reviewer round 1**: 3 P1s — duplicate simultaneous dialogs possible (two independent `open` states), `aria-modal` with no focus trap/Escape, metrics line with no inline `SIMULATION` label. Fixed with a shared context, a real focus trap + Escape, and inline labeling.
- **This fix was itself wrong.** The "shared context" fix still had each `SoftwareLabSection` mount independently render its own `ArchitecturePanel` when the shared flag was true — both rendered simultaneously. The regression test written for this (`toHaveCount(1)`) passed anyway, apparently on a timing fluke. Found instead by writing a broader full-critical-path e2e test (`critical-path.spec.ts`) whose stricter locators failed loudly on the ambiguous match, and confirmed by screenshot showing two literal dialogs on screen. **Real fix**: the panel now renders exactly once, globally, as a proper fixed-position modal (`ArchitectureTableRoot.tsx`); `SoftwareLabSection` is only ever a trigger button.
- **A follow-up focused review on that fix found one more P1**: the modal declared `aria-modal="true"` but background 3D movement (a `window`-level keydown listener) was never actually gated on it being open — arrow keys still moved the camera underneath, which could unmount the landmark-gated 3D trigger mid-dialog and silently break focus-restore. Fixed by gating the movement listener on `encounterPhase === 'greeting' OR architectureTableOpen`.
- **visual-reviewer**: no BLOCKER. 2 P1s (component row read as disconnected boxes, not a pipeline; no evidence captured with the panel over the live 3D world) — fixed with inline flow arrows and an added 3D-mode capture.

## AC Audit (before marking US-010 IMPLEMENTED)

Re-read every Acceptance Criterion in `US-010` against actual behavior before checking any box. Found and closed three real gaps that had no implementation/test yet:
- No slice-endpoint/next-area teaser existed — added a "That's the current slice" section to the semantic shell.
- No single keyboard-only run covered the *entire* critical path (only piecemeal per-feature keyboard tests existed) — added `critical-path.spec.ts`.
- No test proved zero browser requests to Supabase across a full run — added.
- The simulation never mentioned "retry" despite the AC listing it as an expected observable — added retry narration at the point it belongs (API retrying against DATABASE, right before the circuit breaker opens to stop exactly that).

## Validation

Typecheck/lint: PASS
Unit tests: PASS (40 total, 8 new: `simulation.test.ts`)
E2E: PASS (62 total, 20 new: `architecture.spec.ts`, `critical-path.spec.ts`)
Visual inspection: PASS — self-verified after all three fix rounds, including the modal backdrop now correctly dimming the whole page
Performance: bundle PASS (shell 65.66 KB gzip, 3D chunk 237.13 KB gzip, both under budget)

## Known Issues / Deferred to M7

- Engineering Decisions Wall, Technology Wall, Current Workbench, Flagship Projects — MASTER_BACKLOG's fuller M5 ambition beyond the explicit UI Alpha minimum, need Juan's verified content, not built.
- Architecture Table visual polish (raw-feeling gold accents) — cosmetic, deferred.
- Modal backdrop click is inert (only Escape/Close dismiss) — acceptable per WAI-ARIA APG, not a gap.

## Deviations From Spec

None net of the gap-closing above — those gaps existed against the spec's own stated requirements and are now closed, not scope additions.

## Decisions Required

None blocking.

## Recommended Next Milestone

`M6 — Public Portfolio Projection v1` (or defer, since Alpha may ship entirely on the `ADR-005` static-empty artifact) → `M7 — Visual Fidelity Alpha` → `M8 — Quality/Performance/Accessibility` → `M9 — External Audit handoff`, continuing on `feat/US-010-m2-application-foundation`.

## Git

Branch: `feat/US-010-m2-application-foundation`
Latest commit: `1a4e46a`
PR: not yet opened (opens once at the end of the achievable UI Alpha scope)
