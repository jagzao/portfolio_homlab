# HANDOFF — M7 Visual Fidelity Alpha

Interim milestone note (M2–M9 accumulate on one branch; durable handoff/PR finalized at M9).

## Branch

`feat/US-010-m2-application-foundation`, commit `4c853e8`.

## Implemented

Procedural fidelity uplift within ADR-003's primitives-only constraint (no external assets): hemisphere sky/ground lighting, manual day/night toggle with restrained night stars, glass/water materials on the surfaces where it matters, vertical-garden leaf accents, multi-lobe atrium tree canopy.

## Independent Review — real findings, two rounds

- **visual-reviewer round 1**: vertical gardens read as a ladder, not foliage (P1); day/night contrast too subtle in the Atrium (P1); glass/water improvement not perceptible, and self-noted the Bridge's water plane wasn't visible in the capture at all (P2).
- Self-investigating that last P2 found a real bug, not a rendering-scale issue: the single opaque ground plane (covers the full corridor at y=0) had been sitting on top of both water planes (y=-0.05, y=-0.4) since M3 — water has never actually been visible. Fixed by moving water above ground instead of below it.
- **code-reviewer**: Lab-facade vine positions used the wider Exterior facade's x-offset, floating outside the actual (narrower) Lab wall geometry (P2). Missing `clearcoatRoughness` on every clearcoat material (P2). Flagged the 7-surface `meshPhysicalMaterial` rollout had no frame-time measurement (P1) — this caught something real: an initial sample showed desktop p95 at ~28ms vs. the 20ms budget trigger. Investigated across several runs; the dev machine shows real 18-31ms run-to-run variance (isolated single-browser runs land at 18-20ms, concurrent-worker runs show contention). Applied the budget's own prescribed mitigation regardless: reverted 2 glass-wall surfaces to `meshStandardMaterial` (their clearcoat improvement was separately found imperceptible), halved vine leaf count (28→16 draw calls). Kept clearcoat only on the 3 surfaces serving the actual M7 water/reflection goal.

## Validation

Typecheck/lint: PASS
Unit tests: PASS (40, unchanged — no new pure logic in this milestone)
E2E: PASS (50, +2 new: day/night toggle functional test)
Visual inspection: PASS after fixes — water now visibly tinted, foliage reads as foliage, day/night contrast clear, self-verified against fresh screenshots
Performance: bundle PASS (237.78 KB gzip 3D chunk, whole M7 pass added <1KB gzip); frame-time **honestly reported as a range (18-31ms p95 desktop)** due to measured dev-machine variance, not a clean pass/fail — real device measurement remains M8's job

## Known Issues / Deferred to M8

- Frame-time variance on this dev machine makes precise before/after comparison unreliable; M8's performance-reviewer should measure on a controlled/representative device.
- No real day/night skylight-through-roof geometry exists yet (Atrium has no rendered roof) — the sky/lighting palette carries the day/night distinction alone, which is a reasonable graybox-to-fidelity simplification per M7's own "do not implement expensive complete dynamic lighting" guidance.

## Deviations From Spec

None.

## Recommended Next Milestone

`M8 — Quality, Performance, Accessibility and UI Audit Readiness`, continuing on `feat/US-010-m2-application-foundation`.

## Git

Branch: `feat/US-010-m2-application-foundation`
Latest commit: `4c853e8`
PR: not yet opened (opens once at the end of the achievable UI Alpha scope)
