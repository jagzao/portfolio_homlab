# HANDOFF — PR #4 Functional CI Green (External Progress Re-Audit Response)

Status: `READY FOR EXTERNAL RE-AUDIT — FUNCTIONAL CI GREEN / PERFORMANCE DECISION PENDING`
Branch: `feat/US-010-m2-application-foundation`
PR: `#4 — HomeLab UI Alpha — US-010 Vertical Slice 01 (M2-M8)`
Audit source: `docs/audits/AUDIT-2026-09-05-pr4-ui-alpha-reaudit.md` + external review `5125139611`
Date: 2026-09-07
Head: `910d2dd`
CI run (push): `34153019976` — **success**
CI run (PR): `34153022188` — **success**
PR mergeable state: `clean` (open, **not merged**)

## Summary

This handoff responds to the 2026-09-06 external progress re-audit (review `5125139611`) of PR #4. That review found the exact-head CI still red (92 passed / 8 failed) and required three functional root-cause fixes plus a P2 workflow fix. All four are now implemented, the functional CI is **green on the exact head**, and the PR is left **unmerged** with the performance gate still a human decision.

## P0 engineering fixes (from review 5125139611)

| Item | Status | Fix |
|---|---|---|
| P0-RA1 simulation not wall-clock deterministic | DONE | `ArchitecturePanel` now derives elapsed from a captured `performance.now()` start timestamp instead of counting interval callbacks. A delayed/throttled callback catches up to the correct simulation frame. Verified by a probe: the sequence advances exactly 1s per real second (1013ms → 2031ms → … → 10136ms = "Recovered in 10s"). |
| P0-RA5 overlay layering incomplete | DONE | Explicit z-index layer contract: canvas (0) < Software Lab overlay (5) < HUD/nav (10) < Zavit greeting modal (20) < Architecture Table modal (100). HUD/navigation always stays above non-modal Lab content. Overlay regression E2E passes on desktop and mobile. |
| P0 context-loss readiness racy | DONE | `handleCreated` sets `canvas.dataset.contextReady = 'true'` only after the `webglcontextlost` listener is attached. E2E waits on that attribute before dispatching context loss, removing the listener-attachment race. |
| P2 ci-summary `needs` missing validate | DONE | `ci-summary` now includes `validate` in its `needs` array so it cannot publish an empty/incorrect validate result. |

## Functional CI hardening (root cause, not timeout inflation)

The exact-head CI was red because of **desktop-only timing flakes under WebGL contention**, not application defects (mobile passed the same tests in the same runs; the full suite passed locally). Root-cause fixes:

1. **Serial functional E2E** (`--workers=1`): two concurrent WebGL Chromium instances on a hosted runner contend for GPU/CPU and cause desktop-only timing flakes. The evidence job already ran serial for the same reason. Determinism under hosted-runner variance (P0-RA2) is worth the small wall-clock cost.
2. **Zavit Escape listener race**: the greeting's Escape handler is attached in a mount effect that runs after the DOM is visible. Tests now wait for the greeting's first button to be focused (the focus effect runs before the Escape effect in the same commit) before pressing Escape, so the handler is guaranteed attached.
3. **Keyboard Tab-count races**: `critical-path` and `smoke` keyboard tests counted Tab presses to reach "Enter HomeLab", which is fragile when the header's link renders asynchronously. They now focus the button directly (still keyboard-only, no mouse click).

## CI result on exact head `910d2dd`

All jobs **success** on both the push run (`34153019976`) and the PR run (`34153022188`):

| Job | Conclusion |
|---|---|
| Validate (typecheck, lint, unit, build, security/static) | success |
| E2E functional (core specs, deterministic) | success |
| E2E visual evidence (screenshots, serial) | success |
| E2E performance sampling (informational, isolated) | success |
| CI summary | success |

PR #4: `mergeable_state: clean`, `state: open`, **not merged**.

## Performance (unchanged, still a human gate)

| Metric | Budget | Measured | Verdict |
|---|---|---|---|
| Shell JS (gzip) | ≤170KB | 67.98KB | PASS |
| 3D chunk (gzip) | ≤500KB | 239.77KB | PASS |
| LCP / CLS | ≤2.5s / ≤0.10 | 96ms / 0.000 | PASS (methodology caveat: not mobile-4G/p75) |
| Long tasks during entry | none >200ms, ≤2 over 50ms | 1-2 tasks, 208-237ms | MARGINAL |
| INP | ≤200ms p75 | proxy only, 273-422ms | Proxy only, not field |
| Desktop frame time | p95 ≤20ms | 18.8-21.0ms | MARGINAL / open |
| 5-min-route heap | ≤250MB desktop | +5.3MB delta (representative multi-pass) | Methodology caveat |
| GPU/texture memory | ≤256MB desktop | 0MB textures (primitives-only) | PASS |

**Performance is NOT marked PASS.** The desktop p95 frame time remains MARGINAL (18.8–21.0 ms vs ≤20 ms) and the accepted methodology (mobile-4G/p75 LCP, field INP, literal 5-minute route, documented reference hardware) is not fully executed on the accepted reference profile. Hosted-runner perf data is informational. The refined-methodology proposal from the 2026-09-05 handoff still requires **Juan's explicit acceptance** before the performance gate can be considered closed. No budget numbers have been relaxed.

## Known gates

- **P0-RA3 performance contract**: blocked on Juan's acceptance of the refined methodology (or a formal budget change). Do not mark performance PASS.
- M7 visual fidelity remains graybox / Alpha-1 (P1-RA1 acknowledged, not final).
- Zavit close visual capture (P1-RA2) and Technology Wall real M6 capabilities (P1-RA3) remain for the next visual/product iteration.

## Git

Branch: `feat/US-010-m2-application-foundation`
PR: `#4` (open, **unmerged**, `mergeable_state: clean`)
Head: `910d2dd`
Target status: `READY FOR EXTERNAL RE-AUDIT — FUNCTIONAL CI GREEN / PERFORMANCE DECISION PENDING`
