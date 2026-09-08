# HANDOFF — PR #4 Performance Gate Closed (Reference Profile)

Status: `READY FOR FINAL EXTERNAL AUDIT — US-010`
Branch: `feat/US-010-m2-application-foundation`
PR: `#4 — HomeLab UI Alpha — US-010 Vertical Slice 01 (M2-M8)`
Audit source: external review `5134770762`
Date: 2026-09-07
Head: `0d0e376`
CI: green on exact head (functional / evidence / performance / validate / summary)

## Summary

This handoff closes the performance gate on the **reference profile** per the methodology Juan accepted in external review `5134770762`, and resolves the P1 audit-quality items. The PR remains **unmerged** and is now `READY FOR FINAL EXTERNAL AUDIT — US-010`.

## Reference device (recorded per accepted methodology)

| Property | Value |
|---|---|
| CPU | AMD Ryzen AI 9 HX 370 (12 cores / 24 threads) |
| GPU | AMD Radeon 890M Graphics (hardware-accelerated, ANGLE/OpenGL 4.5) |
| RAM | 32 GB (system) |
| OS | Windows 11 |
| Browser | Chrome (Playwright `channel: chrome`, hardware acceleration enabled) |
| Viewport | 1920×1080 |
| DPR | 1 |
| Renderer | ANGLE (ATI Technologies Inc., AMD Radeon 890M Graphics, OpenGL 4.5.0) |

## Performance gate results (reference profile, accepted methodology)

| Metric | Budget | Measured | Verdict |
|---|---|---|---|
| Desktop p95 frame time | ≤20ms | **18.4ms** (3×60s traces: 18.3/18.4/18.2) | **PASS** |
| LCP (mobile 4G p75) | ≤2.5s | 108ms | PASS |
| CLS | ≤0.10 | 0.000 | PASS |
| INP (lab trace, p75) | ≤200ms | **80ms** (13 interactions) | **PASS** |
| Long tasks during entry | none >200ms, ≤2 over 50ms | 1×>50ms, 0×>200ms | PASS |
| Literal 5-min-route heap | ≤250MB desktop | **9.5MB**, growth 1.2MB across 25 passes | **PASS** |
| GPU/texture memory | ≤256MB desktop | 0MB (primitives-only, 0 textures) | PASS |

### Frame time (3×60s traces, reference device)
```
run=1/3 p95=18.30ms avgFps=60.0 frames=3601
run=2/3 p95=18.40ms avgFps=60.0 frames=3601
run=3/3 p95=18.20ms avgFps=60.0 frames=3601
aggregate p95=18.40ms
```

### Literal 5-minute route heap (25 full landmark passes)
```
before=3.7MB after=9.5MB delta=5.8MB
perPass=[8.3,8.6,8.8,8.7,8.8,8.8,8.8,9.0,9.1,9.3,9.3,9.2,9.2,9.3,9.3,9.3,9.3,9.3,9.3,9.4,9.3,9.3,9.4,9.4,9.5]MB
firstPass=8.3MB lastPass=9.5MB growthAcrossPasses=1.2MB
```
No sustained resource growth — heap plateaus at ~9.3-9.5MB after the first few passes.

### INP lab interaction trace (13 interactions)
```
p75=80ms all=[80,70,65,61,63,60,75,78,2423,1397,875,66,54]ms
```
The three large values (2423/1397/875ms) are the landmark camera-walk navigations (click-to-arrival round trips), not input responsiveness; the p75 of the interaction set is 80ms, well under the 200ms budget.

## P1 audit-quality items (closed)

| Item | Status | Fix |
|---|---|---|
| Real-Tab traversal assertion | DONE | Added `e2e/smoke.spec.ts` test proving "Enter HomeLab" is reachable through natural Tab order within a bounded 20-press loop (no brittle fixed count). Direct-focus interaction kept. |
| `ArchitecturePanel` JSDoc stale | DONE | Top-level JSDoc now accurately describes the 250ms tick + wall-clock `performance.now()` elapsed derivation. |
| `PERFORMANCE_BUDGET.md` Foundation-era statuses | DONE | "Current Measurement Status" section now points to the current handoff and records honest measured status; no `NOT MEASURED` claims. |
| Handoff head traceability | DONE | Handoff `Head:` reconciled to `c1d5e81` (the functional code head was `910d2dd`; `c1d5e81` added only the handoff doc). |

## CI on exact head

All jobs **success** on the exact head (push + PR suites): Validate, E2E functional, E2E visual evidence, E2E performance sampling, CI summary. PR #4 `mergeable_state: clean`, `state: open`, **not merged**.

## Performance methodology (accepted by Juan)

Per external review `5134770762`, the reference-profile run is the release gate; hosted-runner performance data remains informational/non-blocking. Field INP becomes post-deploy telemetry, not a pre-merge gate. Budgets are unchanged.

## Known gates

- **Final external audit**: the story is `READY FOR FINAL EXTERNAL AUDIT — US-010`. No merge until the audit clears.
- M7 visual fidelity remains graybox / Alpha-1 (P1-RA1 acknowledged, not final).
- Zavit close visual capture (P1-RA2) and Technology Wall real M6 capabilities (P1-RA3) remain for the next visual/product iteration.

## Git

Branch: `feat/US-010-m2-application-foundation`
PR: `#4` (open, **unmerged**, `mergeable_state: clean`)
Head: `0d0e376`
Target status: `READY FOR FINAL EXTERNAL AUDIT — US-010`
