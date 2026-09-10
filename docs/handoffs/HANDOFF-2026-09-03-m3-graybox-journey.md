# HANDOFF — M3 3D Graybox: First Physical Journey

Interim milestone note (M2–M9 accumulate on one branch; durable handoff/PR finalized at M9).

## Branch

`feat/US-010-m2-application-foundation`, commits `7f8cc97` (implementation), `d54562c` (review fixes).

## Story

`US-010` remains `ACCEPTED` (not `IMPLEMENTED` — M4/M5 still owe the rest of its Acceptance Criteria).

## Implemented

Full graybox journey per ADR-003 (primitives only, zero external assets): forest approach → HomeLab exterior → energy portal → central atrium → bridge → Software Engineering Lab entry marker.

- `src/experience/world/navigation.ts`: pure movement/collision math (`clampToBounds`, `isPointBlocked`, `isSegmentBlocked`, `stepToward`, `nearestLandmarkId`), fully unit-tested.
- `PlayerCamera.tsx`: click-to-walk movement, fixed forward look, reduced-motion instant-snap, throttled position reporting.
- `WorldScene.tsx`: graybox geometry for all six zones; portal posts + atrium tree are real collision obstacles (both endpoint- and path-blocking).
- `LandmarkHud.tsx`: keyboard-reachable landmark jump list, doubles as "you are here" orientation readout.
- `JourneyList.tsx`: semantic equivalent, always rendered, independent of WebGL.
- Keyboard supplemental control (arrow keys/WASD) per US-010's Movement and Input Model.

## Independent Review

Three specialist passes, code+performance clean on the first pass; visual required three fix rounds:

- **code-reviewer**: no BLOCKER/P0. P1 (endpoint-only collision missed mid-path obstacles — added `isSegmentBlocked`), P1 (per-frame `setState` from `useFrame` — throttled), P2 (keyboard test used `.focus()` not real Tab presses — rewritten), P2 (WASD deferral undocumented — implemented instead). All fixed in `d54562c`.
- **performance-reviewer**: no BLOCKER/P0/P1 from static read; corroborated the per-frame `setState` P2, same fix. Bundle size stable (+0.5 KB gzip for the whole world scene).
- **visual-reviewer**: **round 1** — BLOCKER (Lab zone empty void), P0×3 (Atrium camera inside tree canopy/FOV overflow, Portal not visible in its own frame, Bridge near-black), P1 (Exterior indistinguishable from Portal), plus a general "ground too dark" note. **Round 2** fixes (brighter materials/lighting, repositioned Atrium/Portal landmarks) resolved 2 of 3 P0s; Lab BLOCKER and Exterior P1 persisted, Bridge P0 partially resolved (upper frame still black — no sky). **Round 3** fixes (lighter sky + fog, real doorway geometry on the Lab wall instead of a floating slab, widened/mullioned Exterior facade) resolved the remaining findings. Self-verified against fresh evidence before commit.

## Validation

Typecheck/lint: PASS
Unit tests: PASS (25 — capability/shell tests from M2 plus 8 new navigation.ts tests)
E2E: PASS (44 — desktop + mobile Chromium; smoke, world journey, keyboard Tab order, arrow-key movement)
Visual inspection: PASS after 3 rounds — see evidence below
Performance: bundle PASS (shell 63.09 KB gzip, 3D chunk 235.86 KB gzip, both under `PERFORMANCE_BUDGET.md`); frame-time sampled via real Playwright `requestAnimationFrame` capture (`e2e/perf-sample.spec.ts`): ~60fps avg, p95 frame ~18ms, both desktop and mobile-viewport Chromium projects — this validates the code path runs at target frame rate on this dev machine's GPU under both tiers, **not** real mobile-hardware headroom, which stays `NOT MEASURED` (M8's job on representative devices). Web Vitals/JS heap/GPU memory remain `NOT MEASURED`.

### Visual evidence

6 zones × 2 viewports (desktop 1920×1080, mobile Pixel 7), captured via `EVIDENCE_DIR=<dir> npx playwright test m3-evidence`. Not committed to the repo (regenerate on demand); reviewed in-session at each of the 3 fix rounds.

## Known Issues / Deferred to M7 (visual fidelity)

- Portal/Lab-entrance gold accents read as "raw placeholder blocks" per the visual-reviewer's final note — functionally correct (obstacle posts, entrance marker) but not yet restrained/integrated per `docs/vision/ART_DIRECTION.md`'s "reserve gold... for emphasis" guidance. Graybox-appropriate for M3; M7's job to refine.
- Mobile `LandmarkHud` slightly overlaps the Lab doorway geometry on a very tall viewport screenshot — cosmetic, not a functional blocker (list remains legible, `overflow-y: auto` already caps its height).
- No day/night cycle or ambient sound (both explicitly out of Alpha scope per `US-010`).

## Deviations From Spec

None. Stayed within `M3`'s graybox-primitives scope; no Zavit (`M4`) or Software Lab interior content (`M5`) added — confirmed by code-reviewer.

## Decisions Required

None blocking.

## Recommended Next Milestone

`M4 — Zavit v1`, continuing on `feat/US-010-m2-application-foundation`.

## Git

Branch: `feat/US-010-m2-application-foundation`
Latest commit: `d54562c` (plus the FPS-sample/doc-update commit immediately following this handoff)
PR: not yet opened (opens once at the end of the achievable UI Alpha scope)
