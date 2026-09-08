# HANDOFF — PR #4 Final External Re-Audit Response (Performance Evidence Validated)

Status: `READY FOR FINAL EXTERNAL RE-AUDIT — US-010 / PERFORMANCE EVIDENCE VALIDATED`
Branch: `feat/US-010-m2-application-foundation`
PR: `#4 — HomeLab UI Alpha — US-010 Vertical Slice 01 (M2-M8)`
Audit source: Final External Audit `5136245139`
Date: 2026-09-08
Head: `f12fa86`
CI: green on exact head (functional / evidence / performance / validate / summary)

## Traceability (reconciled per audit P1-2)

| Role | Head |
|---|---|
| Performance-evidence head (methodology fixes + specs) | `f12fa86` |
| Final test-hardening head (Tab-traversal timeout) | `fed7e9b` |
| Actual PR head | `f12fa86` |

The performance-evidence work (`f12fa86`) builds on the test-hardening head (`fed7e9b`); both are green in CI. The PR body and this handoff track the actual PR head `f12fa86`.

## Summary

This handoff responds to Final External Audit `5136245139`. The two P0 performance-evidence defects are fixed (real navigation during frame traces; reproducible mobile-4G LCP/CLS), the P1 lifecycle/traceability/labeling items are resolved, and the reference-profile performance gate is re-validated with the corrected methodology. The PR remains **unmerged** and is now `READY FOR FINAL EXTERNAL RE-AUDIT — US-010 / PERFORMANCE EVIDENCE VALIDATED`.

## P0-1 — Reference frame-time methodology (fixed)

`e2e/perf-ref-frame.spec.ts` now drives **real representative navigation** (the full landmark route, walked repeatedly) throughout each 60s trace — not an idle camera. It retains the raw frame-time samples per run, reports each run's p95, concatenates ALL raw samples, and computes the aggregate p95 over the concatenated set. Budget remains `<=20ms` (not relaxed).

### Result (reference device, production build, 10s warm-up, 3×60s traces with real navigation)

```
run=1/3 p95=18.50ms avgFps=59.9 frames=3907
run=2/3 p95=18.20ms avgFps=60.0 frames=4208
run=3/3 p95=18.20ms avgFps=60.0 frames=4201
aggregate p95=18.30ms totalSamples=12316 runP95s=[18.50,18.20,18.20]ms
```

**Aggregate p95 = 18.30ms <= 20ms → PASS.** Raw samples retained in the spec's `__frameSamples` accumulation; the aggregate is computed over the concatenated 12,316 samples.

## P0-2 — Mobile-4G LCP/CLS (fixed, reproducible)

New `e2e/perf-ref-vitals.spec.ts` + `playwright.perf-mobile.config.ts` apply **4 Mbps / 150ms RTT** via CDP network throttling, run **10 clean-cache runs** (fresh context each run), record all 10 LCP and CLS values, and compute p75. Method and raw evidence are durable in the repo.

### Result (mobile 4G, 10 clean-cache runs)

```
run=1/10 LCP=616ms CLS=0.000
run=2/10 LCP=604ms CLS=0.000
run=3/10 LCP=628ms CLS=0.000
run=4/10 LCP=576ms CLS=0.000
run=5/10 LCP=636ms CLS=0.000
run=6/10 LCP=560ms CLS=0.000
run=7/10 LCP=576ms CLS=0.000
run=8/10 LCP=560ms CLS=0.000
run=9/10 LCP=540ms CLS=0.000
run=10/10 LCP=580ms CLS=0.000
LCP all=[616,604,628,576,636,560,576,560,540,580]ms p75=616ms
CLS all=[0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000,0.000] p75=0.000
```

**LCP p75 = 616ms <= 2.5s → PASS. CLS p75 = 0.000 <= 0.10 → PASS.**

## P1-1 — US-010 lifecycle (fixed)

`US-010` moved `ACCEPTED → IMPLEMENTED` per `.agents/AGENTS.md` §5: implementation and applicable internal validation (including the reference-profile performance evidence) are complete on the working branch. The external re-audit will decide whether it can move to `AUDITED`.

## P1-2 — Traceability (fixed)

See the traceability table above. The PR body and this handoff track the actual PR head `f12fa86`.

## P1-3 — INP labeling (fixed)

`e2e/perf-ref-inp.spec.ts` is now labeled **"lab interaction latency p75 (INP proxy)"** — a click-to-visible-effect round-trip proxy, explicitly NOT the browser Event Timing INP metric. Field INP remains post-deploy telemetry.

### Result (lab interaction latency p75 / INP proxy)

```
interactions=13 p75=84ms all=[84,56,72,60,78,72,67,71,2446,896,1401,72,60]ms
```

**p75 = 84ms <= 200ms → PASS.** (The three large values are landmark camera-walk navigations, not input responsiveness.)

## Full reference-profile performance gate (re-validated)

| Metric | Budget | Measured | Verdict |
|---|---|---|---|
| Desktop p95 frame time (real nav, aggregate over concatenated samples) | <=20ms | **18.30ms** (12,316 samples) | **PASS** |
| LCP (mobile 4G, p75 of 10 clean-cache runs) | <=2.5s | **616ms** | **PASS** |
| CLS (mobile 4G, p75) | <=0.10 | **0.000** | **PASS** |
| Lab interaction latency p75 (INP proxy) | <=200ms | **84ms** (13 interactions) | **PASS** |
| Long tasks during entry | none >200ms, <=2 over 50ms | 1x>50ms, 0x>200ms | PASS |
| Literal 5-min-route heap | <=250MB | **9.3MB**, growth 0.9MB | **PASS** |
| GPU/texture memory | <=256MB | 0MB (primitives-only) | PASS |

## Reference device (recorded per accepted methodology)

| Property | Value |
|---|---|
| CPU | AMD Ryzen AI 9 HX 370 (12 cores / 24 threads) |
| GPU | AMD Radeon 890M Graphics (hardware-accelerated, ANGLE/OpenGL 4.5) |
| RAM | 32 GB (system) |
| OS | Windows 11 |
| Browser | Chrome (Playwright `channel: chrome`, hardware acceleration enabled) |
| Viewport | 1920×1080 (desktop) / 412×915 (mobile) |
| DPR | 1 (desktop) / 2.625 (mobile) |
| Renderer | ANGLE (ATI Technologies Inc., AMD Radeon 890M Graphics, OpenGL 4.5.0) |

## CI on exact head

All jobs **success** on the exact head (push + PR suites): Validate, E2E functional, E2E visual evidence, E2E performance sampling, CI summary. PR #4 `mergeable_state: clean`, `state: open`, **not merged**.

## Known gates

- **Final external re-audit**: the story is `READY FOR FINAL EXTERNAL RE-AUDIT — US-010 / PERFORMANCE EVIDENCE VALIDATED`. No merge until the audit clears.
- M7 visual fidelity remains graybox / Alpha-1 (P1-RA1 acknowledged, not final).
- Zavit close visual capture (P1-RA2) and Technology Wall real M6 capabilities (P1-RA3) remain for the next visual/product iteration.

## Git

Branch: `feat/US-010-m2-application-foundation`
PR: `#4` (open, **unmerged**, `mergeable_state: clean`)
Head: `f12fa86`
Target status: `READY FOR FINAL EXTERNAL RE-AUDIT — US-010 / PERFORMANCE EVIDENCE VALIDATED`
