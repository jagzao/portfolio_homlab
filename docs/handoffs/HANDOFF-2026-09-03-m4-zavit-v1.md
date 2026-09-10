# HANDOFF — M4 Zavit v1

Interim milestone note (M2–M9 accumulate on one branch; durable handoff/PR finalized at M9).

## Branch

`feat/US-010-m2-application-foundation`, commit `c0c45e3` (implementation + all review fixes, one commit).

## Story

`US-010` remains `ACCEPTED` (not `IMPLEMENTED` — M5 still owes the rest of its Acceptance Criteria).

## Implemented

Graybox Zavit v1 per `MASTER_BACKLOG.md` M4, standing in the Central Atrium:

- `src/experience/zavit/Zavit.tsx`: required traits per `ART_DIRECTION.md` — black body, white belly screen, illuminated eyes (color by state), head buttons, red claw hands. Idle head-turn while "working," skipped under reduced motion. Nothing beyond the accepted description was invented.
- `src/experience/zavit/encounter.ts`: pure proximity/phase logic (`isWithinNoticeRadius`, `nextEncounterPhase`), unit-tested.
- `ZavitGreeting.tsx`: brief, skippable greeting offering Guided Mode / Free Exploration / Skip. Never retriggers after dismissal.
- `GuidedControls.tsx`: Guided Mode's visible "Continue" control, click/Space/right-arrow, one-click exit to Free Exploration.
- `journeyObstacles.ts`: unified obstacle source (portal posts + atrium tree + Zavit) shared by click-to-walk and keyboard movement.

## Independent Review

- **code-reviewer**: **1 P0** — `advanceGuided()`'s keyboard path closed over `guidedIndex` at mount time (the keydown listener binds once with an empty dep array), so Space/ArrowRight always re-targeted the same landmark; the mouse Continue button worked (fresh closure per render) so this was easy to miss. Fixed by reading `guidedIndexRef.current` at call time instead of the closed-over state. **1 P1** — `ZavitGreeting`'s dialog had no `aria-modal` or focus management. **P2s** — Zavit missing from the keyboard-obstacle list, a noticing→greeting timer race, a fragile landmark-index fallback. All fixed in the same commit; a regression e2e test (two consecutive keyboard advances land on two different stops) locks in the P0 fix — this is exactly the case a stale closure fails and a click-only test would miss.
- **visual-reviewer**: no BLOCKER. **1 P1** — Zavit's original position (x=3) fell almost entirely outside the horizontal FOV on portrait/mobile viewports (narrower aspect ratio means less horizontal FOV at a fixed 60° vertical), leaving only a sliver visible. Repositioned to x=1.5. **P2s** — proactively fixed the "red hands read as feet" issue (added a base pedestal, raised the arms) even though not explicitly re-verified by a second visual pass; self-verified against fresh screenshots. Remaining P2/P3 (static idle pose, small head-button scale) deferred to `M7`.
- No separate `performance-reviewer` pass this milestone — bundle delta was ~0.1 KB gzip and no new per-frame-heavy pattern was introduced beyond what `M3` already reviewed.

## Validation

Typecheck/lint: PASS
Unit tests: PASS (32 total, 7 new in `encounter.test.ts`)
E2E: PASS (62 total, 10 new in `zavit.spec.ts` — greeting flow, no-retrigger, Guided Mode via click and via keyboard, reduced-motion timing)
Visual inspection: PASS — greeting, idle, and Guided Mode states captured at both viewports, self-verified after each fix round
Performance: bundle PASS (3D chunk 237.07 KB gzip, still under the 500 KB budget; delta from M3 is negligible)

## Known Issues / Deferred to M7

- Zavit's idle pose is static (arms at sides) rather than visibly "doing something purposeful" per `ART_DIRECTION.md`'s "never posed as a static receptionist" — no animation system exists yet at graybox stage; tracked, not silently dropped.
- Head buttons are small at graybox scale; legible in captures but not prominent.
- Final Zavit proportions/model remain `UNKNOWN` pending a stronger visual/photo reference from Juan, per `MASTER_BACKLOG.md`'s explicit M4 fidelity blocker.

## Deviations From Spec

None. Stayed within M4's scope; no Software Lab interior content (`M5`) added.

## Decisions Required

None blocking.

## Recommended Next Milestone

`M5 — Software Engineering Lab UI + Interactive Architecture`, continuing on `feat/US-010-m2-application-foundation`.

## Git

Branch: `feat/US-010-m2-application-foundation`
Latest commit: `c0c45e3`
PR: not yet opened (opens once at the end of the achievable UI Alpha scope)
