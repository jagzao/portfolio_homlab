# HANDOFF — M8 Quality, Performance, Accessibility and UI Audit Readiness

Interim milestone note (M2–M9 accumulate on one branch; durable handoff/PR finalized at M9).

## Branch

`feat/US-010-m2-application-foundation`, commit `4579022`.

## Implemented

Holistic (whole-alpha, M2-M7) quality pass: three independent specialist reviews run in parallel with fresh context (no self-review), every finding investigated and either fixed or honestly documented as a gap. Added M8-specific measurements that didn't exist before this milestone: JS heap leak-check across enter/exit cycles, Web Vitals on initial load, long-task sampling, and an INP proxy.

## Independent Review — three parallel holistic passes

**code-reviewer** (whole `src/` + `e2e/` tree, ADR-001..005 traceability): no BLOCKER. One P1 — `ZavitGreeting.tsx` declared `aria-modal="true"` with no focus-trap or Escape handler, unlike `ArchitecturePanel.tsx` which correctly has both. Fixed by mirroring that existing pattern exactly, plus new `e2e/zavit.spec.ts` tests (`Escape dismisses the greeting, same as Skip`; `Tab wraps focus inside the greeting instead of escaping into background content`). One P2 — Guided Mode advance and the LandmarkHud jump set the movement target directly with no `isSegmentBlocked` check (unlike click-to-walk and keyboard nudge), and the Atrium→Bridge straight line ran directly through the Atrium tree. Fixed by moving the tree obstacle off the corridor centerline (`x=0 → x=-3`) rather than adding full path-routing, with the tradeoff explicitly documented in `landmarks.ts` and a new unit test (`navigation.test.ts`) asserting every consecutive real-landmark pair stays clear against the real obstacle list.

**visual-reviewer** (33 fresh captures, desktop+mobile, all M8-required states): semantic shell, WebGL-unavailable, data-saver, recoverable-failure, reduced-motion, and loading states all solid — legible, no fabricated content, no blank/broken layouts. Three P1s:
1. Atrium water was never actually visible in any capture (day, night, or mobile) — not because it wasn't rendering, but because the tree sat dead-center blocking the forward view and the landmark's arrival point kept the water plane's near edge outside the camera's forward FOV (the camera looks perfectly level, so nearby ground falls below the frame). Fixed by moving the tree off-axis and the Atrium landmark 2 units closer, plus deepening the water's color/opacity so it reads clearly against the sky/fog tone instead of blending into it.
2. `arch-04-in-3d.png` captured the wrong location (Forest Approach, not the Lab) because the evidence test clicked "Open Architecture Table" with `.first()` before the walk to the Lab had actually finished, and before the 3D-embedded trigger even existed in the DOM (it only renders once `currentLandmarkId === 'software-lab'`). Fixed by waiting for real arrival (`aria-current="location"`) and scoping the click to the trigger inside the 3D experience's own container.
3. Mobile captures showed Zavit's greeting stuck open over unrelated zones (Bridge, Lab, night Atrium). Investigating this — not dismissed as a mobile quirk — found it reproduces on desktop too under load: the proximity trigger can fire mid-transit on any walk that passes near the Atrium, and whether a given walk lingers in the notice radius long enough is frame-timing-sensitive. The evidence-capture tests now dismiss any greeting that happens to appear before capturing a zone.
One P2 (not fixed, low priority): `zavit-01-idle.png` duplicates the Forest Approach establishing shot rather than showing Zavit up close.

**performance-reviewer** (against `docs/architecture/PERFORMANCE_BUDGET.md`, line by line): bundle/delivery budgets all PASS with large margins (shell 65.66 KB gzip vs ≤170KB, 3D chunk 237.99 KB gzip vs ≤500KB). LCP/CLS pass by a wide margin (96ms/0.000) but not via the budget's specified mobile-4G-throttled/p75 methodology. Flagged four real measurement gaps that were then closed this milestone: INP (added a documented proxy plus a real long-task sample), and re-measured desktop 3D frame time fresh rather than trusting M7's already-self-described-unreliable range. Two gaps remain open and documented rather than faked: a sustained 5-minute-route heap check, and real GPU/renderer profiling (a static draw-call count from source is offered as a partial substitute, not a replacement).

## A bug no reviewer reported

While re-verifying the mobile stuck-greeting finding, self-investigation (not either reviewer) found the real underlying defect: Zavit's greeting and the Architecture Table could be open **simultaneously** — two independent `aria-modal="true"` dialogs stacked on screen at once, reproducible on desktop too. Fixed by making the two mutually exclusive in the state machine: the greeting's noticing→greeting timer now holds (and retries) while the Architecture Table is open, and the in-3D Architecture Table trigger is hidden while the greeting is open. This is the third time on this project a review finding led to a deeper bug than the one originally reported (see M5's duplicate-dialog saga and M7's water-occlusion bug) — worth continuing to treat "looks fine but let me check anyway" as the default rather than the exception.

## Validation

Typecheck/lint: PASS
Unit tests: PASS (41, +1 new: real-landmark-data obstacle-clearance regression)
E2E: PASS (116, desktop+mobile, final full run 2026-09-04, zero failures)
Visual inspection: PASS after fixes — Atrium water now visibly tinted at every camera angle checked, in-3D architecture capture shows the correct location, evidence captures no longer show a stray stuck dialog
Performance:
- Bundle: PASS, large margins (65.66 KB / 237.99 KB gzip)
- Heap: PASS, +0.4MB over 5 enter/exit cycles, no leak signal
- LCP/CLS: PASS by margin (96ms / 0.000), methodology caveat noted above
- Long tasks during entry: PASS (1 task, 109-131ms across runs — over 50ms but under 200ms, within the "≤2 over 50ms, none over 200ms" budget)
- INP: no field measurement exists; proxy only (47-241ms across runs), explicitly labeled as likely overstating real INP
- Mobile (adapted tier) frame time: PASS (60fps avg, 17.6-18.1ms p95), with the standing caveat this is emulated viewport on desktop GPU, not real mobile hardware
- **Desktop frame time: marginal FAIL / inconclusive.** 4 fresh samples this milestone (mixed isolated and contended runs) cluster at 21.3-25.1ms p95, over the 20ms budget in all four. The dev machine had ~37 concurrent Chrome processes from unrelated sessions during measurement, which plausibly inflates this, but that could not be controlled for in this shared environment. **This needs a real re-measurement on a quiet/dedicated device before being certified as a final gate result.**

## Known Issues / Deferred

- Desktop 3D frame time needs a clean re-measurement on an uncontended device (see above) — the single most important open item from this milestone.
- Sustained 5-minute-route heap behavior not measured (only immediate pre/post 5-cycle-reload snapshots exist).
- Real GPU/renderer/texture-memory profiling not performed; a static draw-call count (~70 full-tier/~64 adapted-tier, no shadows) stands in as a partial, non-equivalent substitute.
- The exact mechanism behind the ~34-minute hang seen on 2 mobile-chromium tests during one contended full-suite run remains undiagnosed, though a clean 116/116 rerun afterward is strong evidence it was transient system load, not a reproducible product defect.
- `zavit-01-idle.png` evidence capture doesn't uniquely show Zavit (duplicates another capture) — cosmetic, not reopened.

## Deviations From Spec

None.

## Recommended Next Milestone

`M9 — External Audit: UI Alpha` — open the accumulated branch as a PR (do not merge), assemble the complete handoff, stop for external audit.

## Git

Branch: `feat/US-010-m2-application-foundation`
Latest commit: `4579022`
PR: not yet opened (opens at M9, end of the achievable UI Alpha scope)
