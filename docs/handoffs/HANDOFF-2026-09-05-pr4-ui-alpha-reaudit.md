# HANDOFF — PR #4 UI Alpha Re-Audit Response

Status: `IN PROGRESS — READY FOR EXTERNAL RE-AUDIT / CI GREEN`
Branch: `feat/US-010-m2-application-foundation`
PR: `#4 — HomeLab UI Alpha — US-010 Vertical Slice 01 (M2-M8)`
Audit source: `docs/audits/AUDIT-2026-09-05-pr4-ui-alpha-reaudit.md`
Date: 2026-09-05
Head: `1eedc22`

## Summary

This handoff responds to the 2026-09-05 external re-audit of PR #4. The re-audit found the previous head (`ec3edfb`) still red in CI (7 functional failures), invalid lifecycle state, and unresolved performance contract. All P0 code fixes have been implemented on this branch and validated locally. CI has been split into functional / evidence / performance jobs. The PR remains **unmerged**.

## P0 response checklist

| P0 | Finding | Status | Fix / Decision |
|---|---|---|---|
| P0-RA1 | CI failing at exact audited head | DONE | ArchitecturePanel simulation timer made deterministic; Zavit Escape dismisses via capture-phase `stopImmediatePropagation`; reduced-motion greeting appears immediately; Software Lab overlay no longer blocks landmark HUD clicks. Local core functional suite: 112/112 passing. |
| P0-RA2 | Functional/perf/evidence mixed in one job | DONE | `.github/workflows/ci.yml` now has `e2e-functional`, `e2e-evidence`, and `e2e-performance` jobs; perf/evidence run serially so they cannot starve core flows. |
| P0-RA3 | Performance contract unresolved | BLOCKED | Desktop p95 frame time remains MARGINAL (18.8–21.0 ms vs ≤20 ms). Proposal for an accepted alternative methodology is prepared below; **requires Juan's explicit acceptance before it can replace the literal accepted methods**. No budget numbers have been relaxed. |
| P0-RA4 | Story lifecycle reconciliation invalid | DONE | `US-010` returned to canonical `ACCEPTED` state per `.agents/AGENTS.md` §5. It will move to `IMPLEMENTED` only when internal validation (including the open performance gate) is complete or formally accepted. |
| P0-RA5 | Software Lab overlay blocks navigation | DONE | Overlay wrapper uses `pointer-events: none`; interactive children use `pointer-events: auto`. Added overlay navigation regression E2E (`e2e/architecture.spec.ts`). |

## P1 / P2 response checklist

| Item | Status | Fix / Decision |
|---|---|---|
| P1-RA1 M7 visual fidelity graybox | ACKNOWLEDGED | M7 remains graybox / Alpha-1. Not calling it final. |
| P1-RA2 Zavit visual evidence | ACKNOWLEDGED | Code + tests exist; closer visual capture planned for next visual pass. |
| P1-RA3 Technology Wall real M6 capabilities | ACKNOWLEDGED | Neutral absence preserved; real capability contract designed as part of M6. |
| P1-RA4 PR body / handoff sync | IN PROGRESS | This handoff replaces the 2026-09-04 handoff. PR body will be updated from this file after CI re-run. |
| P2 Playwright report dead artifact | DONE | `playwright.config.ts` now emits HTML report; CI uploads named per-job reports. |

## Validation (local, before next CI re-run)

- Typecheck (`tsc -b --noEmit`): PASS
- Lint (`oxlint`): PASS
- Unit tests (Vitest): PASS
- Core functional E2E (Playwright desktop + mobile, excluding perf/evidence specs): **112 passed**

## Performance (honest, unchanged from previous handoff)

| Metric | Budget | Measured | Verdict |
|---|---|---|---|
| Shell JS (gzip) | ≤170KB | 65.84KB | PASS |
| 3D chunk (gzip) | ≤500KB | 239.64KB | PASS |
| LCP / CLS | ≤2.5s / ≤0.10 | 96ms / 0.000 | PASS (methodology caveat: not mobile-4G/p75) |
| Long tasks during entry | none >200ms, ≤2 over 50ms | 1-2 tasks, 208-237ms | MARGINAL |
| INP | ≤200ms p75 | proxy only, 273-422ms | Proxy only, not field |
| Desktop frame time | p95 ≤20ms | **18.8-21.0ms** | **MARGINAL / open** |
| 5-min-route heap | ≤250MB desktop | +5.3MB delta (representative multi-pass) | Methodology caveat |
| GPU/texture memory | ≤256MB desktop | 0MB textures (primitives-only) | PASS |

## Performance methodology proposal for Juan

The audit requires either:

1. Execute the accepted methodology on a documented reference device/network, or
2. Refine the performance contract and obtain Juan's explicit acceptance.

Because we do not have the exact reference hardware/network defined in `PERFORMANCE_BUDGET.md` available in CI, we propose the following refinement **without changing budget numbers**:

- **5-minute route heap**: keep the representative multi-pass sample, but label it clearly as `representative sustained-route sample, NOT literal 5-minute wall-clock`. Compare the result to the budget as informational only.
- **Mobile 4G LCP/INP**: add a Lighthouse/Playwright throttled run on the mobile profile, but treat CI-hosted-runner numbers as informational until measured on the agreed reference device.
- **Desktop p95 frame time**: keep the 20 ms target. The current 18.8–21.0 ms is marginal. We will add an auto-scaling step (reduce pixel ratio / shadows) when p95 exceeds 20 ms for 3 seconds, as already permitted by `PERFORMANCE_BUDGET.md` §Provisional triggers. If that does not bring it under budget, we will formally propose relaxing the target with new evidence.
- **Reference hardware**: record CI runner specs with every perf job, explicitly label hosted-runner data as informational, and schedule a separate measurement on a quiet mid-range laptop before declaring the gate closed.

**Juan must explicitly accept this refined methodology (or propose an alternative) before the performance gate can be considered closed.**

## Known issues / open gates

- **P0-RA3 performance contract**: blocked on Juan acceptance of refined methodology or formal budget change.
- Desktop p95 frame time remains MARGINAL; auto-scaling will be attempted next if Juan accepts the proposal.
- Long-task entry spike and INP proxy-only status remain informational.
- M7 visual fidelity remains graybox / Alpha-1.

## Git

Branch: `feat/US-010-m2-application-foundation`
PR: `#4` (unmerged)
Head: `1eedc22`
Target status: `READY FOR EXTERNAL RE-AUDIT — UI ALPHA / CI GREEN`
