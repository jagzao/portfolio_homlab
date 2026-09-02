# Performance Budget

Status: FOUNDATION / PROVISIONAL
Traceability: US-004
Last updated: 2026-08-31

## Purpose

Set initial guardrails before an executable application exists. Every numerical limit below is **PROVISIONAL** until measured on the first accepted vertical slice. No runtime performance is claimed in Foundation.

## Test Profiles

| Profile | Provisional environment | Experience expectation |
| --- | --- | --- |
| Desktop target | Current mid-range laptop, 1080p, hardware acceleration | Full 3D |
| Mobile target | Mid-range mobile, 390x844 viewport | Adapted 3D or semantic mode |
| Constrained | Reduced motion/data saver, low capability, or WebGL failure | Semantic portfolio; no blocked content |
| Network | Mobile 4G profile: 4 Mbps down, 150 ms RTT | Progressive load |

Exact reference hardware must be recorded with the US-010 benchmark. Budgets may change only with measured evidence and documented rationale.

## Delivery Budgets

All transfer sizes are compressed network bytes.

| Metric | Provisional target | Validation |
| --- | ---: | --- |
| Initial semantic shell JS | <= 170 KB | production bundle report |
| Initial CSS | <= 50 KB | production bundle report |
| Initial semantic route total | <= 350 KB excluding fonts/images | network capture on clean cache |
| 3D runtime chunk | <= 500 KB | lazy-chunk bundle report |
| Critical pre-entry visual assets | <= 1.5 MB | clean-cache network capture |
| First playable 3D payload | <= 4 MB | asset manifest + network capture |
| Any single texture | <= 1 MB | built asset inventory |
| Any single model | <= 2 MB | built asset inventory |
| Total initially loaded textures | <= 3 MB | network/GPU asset inventory |

The 3D runtime and world assets must not block semantic content. Later pavilion assets load behind explicit journey boundaries.

## User Experience Budgets

| Metric | Provisional target | Validation |
| --- | ---: | --- |
| LCP, mobile 4G profile | <= 2.5 s at p75 | Lighthouse plus field data when available |
| INP | <= 200 ms at p75 | lab interaction trace, then field data |
| CLS | <= 0.10 at p75 | Lighthouse/browser trace |
| Semantic interaction ready | <= 3 s on mobile profile | scripted clean-cache run |
| 3D entry ready after opt-in | <= 5 s on desktop profile | performance marks |
| Desktop animation | >= 60 FPS target; p95 frame <= 20 ms | 60-second representative trace |
| Adapted mobile animation | >= 30 FPS; p95 frame <= 35 ms | 60-second representative trace |
| Long tasks during entry | none > 200 ms; <= 2 over 50 ms | performance trace |

Frame targets apply during representative navigation after loading, not an idle camera. If mobile cannot sustain its budget, select the semantic/degraded experience instead of hiding unusable performance.

## Memory and GPU Guardrails

| Metric | Provisional target | Validation |
| --- | ---: | --- |
| Desktop JS heap after 5-minute route | <= 250 MB | browser memory sampling |
| Mobile JS heap after 5-minute route | <= 150 MB | device/browser memory sampling |
| GPU texture memory estimate, initial slice | <= 256 MB desktop; <= 128 MB mobile | renderer/asset inventory and device profiling |
| Detached/leaked route resources | no sustained growth across 5 enter/exit cycles | heap snapshots + renderer counters |

GPU memory is an estimate because browser/driver reporting varies. Record measurement method and device rather than claiming false precision.

## Quality Scaling

Scaling order should preserve information and interaction:

1. reduce pixel ratio and shadow quality;
2. reduce reflections, post-processing, particles, vegetation density, and animation frequency;
3. select lower texture/model LODs;
4. disable nonessential ambience;
5. switch to semantic portfolio mode when minimum interaction quality cannot be sustained.

Reduced-motion mode removes nonessential camera movement and continuous decorative animation. It must not remove content.

### Provisional triggers

- If desktop p95 frame time exceeds 20 ms for 3 consecutive seconds, reduce pixel ratio/shadows first.
- If adapted-mobile p95 frame time exceeds 35 ms for 3 consecutive seconds, reduce reflections, post-processing, particles, and vegetation density.
- If either profile remains above budget after two scaling steps, select lower LOD/texture quality.
- If the minimum interaction path still misses budget after all visual reductions, switch to semantic/degraded mode.

Triggers are provisional and must be calibrated against US-010 reference devices.

## Asset Rules

- Inventory every built asset with source size, transfer size, decoded/GPU estimate, owner, and loading boundary.
- Use modern texture/model compression only after visual and device validation.
- Reuse and instance repeated geometry/materials where measurement shows benefit.
- Dispose resources at lifecycle boundaries and test repeated navigation.
- No asset may be globally preloaded solely because a later area might need it.

## Validation Protocol for US-010

1. Build production artifacts and store bundle/asset inventory in the handoff.
2. Test clean and warm cache on documented desktop and mobile profiles.
3. Capture Web Vitals, loading waterfall, long tasks, 60-second frame trace, heap, and renderer/GPU counters.
4. Exercise reduced-motion, constrained network, WebGL failure, and semantic mode.
5. Compare results with each provisional budget; record PASS, FAIL, or NOT MEASURED.
6. If a budget is unrealistic, revise it with evidence through the accepted spec/ADR process.

Reconciled against `docs/adr/ADR-001-rendering-framework.md` and `docs/adr/ADR-003-asset-pipeline.md`: the React Three Fiber spike measured ~294 KB gzip for an empty scene against the 500 KB gzip 3D-runtime-chunk budget above, leaving ~200 KB gzip headroom for the actual graybox scene and interaction code. This is workable but tight, and it is why `ADR-003` defers all compression tooling until a measured trigger and why per-zone code splitting (`docs/architecture/TECHNICAL_ARCHITECTURE.md` Capability and Loading Boundaries) is required, not optional, for `US-010`. See `docs/specs/US-010-vertical-slice-01.md` Performance Requirements for the full reconciliation.

## Current Measurement Status

Build: N/A
Web Vitals: NOT MEASURED
FPS/frame time: NOT MEASURED
Memory/GPU: NOT MEASURED
Asset weight: NOT MEASURED

No executable application exists in Foundation; these statuses must not be represented as passes.
