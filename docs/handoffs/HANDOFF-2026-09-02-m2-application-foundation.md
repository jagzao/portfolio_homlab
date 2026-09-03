# HANDOFF — M2 Application Foundation + Semantic UI

Interim milestone note (not a PR/audit handoff — `M2`–`M9` accumulate on one branch per the UI Alpha instruction; the durable handoff and PR are finalized at `M9`). Recorded here for traceability of this increment's evidence.

## Branch

`feat/US-010-m2-application-foundation`, based on `main` at `a05e9f0`.

## Commits

`8a971e1`/`9f08a78` (amended) application foundation; `750821b` code-reviewer fixes; `720ed4f` missing evidence states.

## Story

`US-010` remains `ACCEPTED` (not `IMPLEMENTED` — this is one slice of the full journey).

## Implemented

- Vite + React + TypeScript + React Three Fiber app scaffold (`ADR-001`).
- `SemanticShell`: identifies Juan and HomeLab, fully usable without WebGL.
- `detectCapability` + `ExperienceBoundary`: entry-time capability detection and degraded-mode routing per `ADR-002`, loading the 3D chunk only after capability check + explicit visitor intent.
- `CanvasErrorBoundary`: catches runtime WebGL failures, recoverable via notice + retry, never a blank screen.
- `Experience3D`: single graybox primitive per `ADR-003` — the real journey is `M3`.
- `content/client.ts` + `types.ts` + `portfolio.public.json`: `ADR-005` static knowledge-client interface, proven end-to-end via `ProfileSummary` (renders neutral absence — nothing — since no profile is published yet, per `docs/architecture/CONTENT_MODEL.md`).

## Changed Files

30 files added under `src/`, `e2e/`, plus root tooling config (`package.json`, `vite.config.ts`, `playwright.config.ts`, `tsconfig*.json`, `.oxlintrc.json`, `.gitignore`).

## Independent Review

- **code-reviewer**: no BLOCKER/P0. P1 (missing test for the recoverable-3D-load-failure state) and P2s (unused `ExperienceTier`/`useReducedMotion`, misleading "Contact" label) fixed in `750821b`.
- **visual-reviewer**: no BLOCKER/P0/P1. P2/P3 polish notes (CTA button styling, body-copy contrast, a desktop-only capture artifact) deferred to the `M7` visual fidelity pass.
- **performance-reviewer**: no BLOCKER/P0/P1. All measured budgets PASS; two P2 documentation-clarity notes folded into this handoff (see Performance below).

## Validation

Build: PASS (`tsc -b && vite build`)
Typecheck: PASS (`tsc -b --noEmit`)
Lint: PASS (`oxlint`)
Unit tests: PASS (17 tests — capability detection, App shell, `ExperienceBoundary` recovery, knowledge client, `ProfileSummary`)
E2E: PASS (24 tests, desktop + mobile Chromium — shell load, keyboard-only entry, WebGL-unavailable fallback, data-saver opt-in, reduced motion)
Visual inspection: PASS — all 7 required M2 states (`.agents/tasks/MASTER_BACKLOG.md` M2 "Required states") captured at both viewports via Playwright screenshot, reviewed by `visual-reviewer`.
Performance: PASS on all measured budgets; Web Vitals/frame-time/memory/GPU explicitly `NOT MEASURED` (require a running app instrumented beyond a `dist/` listing — planned for `M8`).

### Bundle sizes (real, `npm run build`)

| Artifact | Raw | Gzip | Budget (`PERFORMANCE_BUDGET.md`) | Result |
|---|---:|---:|---:|---|
| `index.html` | 0.60 KB | 0.37 KB | — | — |
| shell CSS | 0.90 KB | 0.47 KB | ≤50 KB | PASS |
| shell JS (eager) | 197.85 KB | 62.65 KB | ≤170 KB | PASS |
| Experience3D chunk (lazy) | 880.98 KB | 233.87 KB | ≤500 KB | PASS |
| initial semantic route total | — | 63.49 KB | ≤350 KB | PASS |

`ADR-001`'s spike (129.37 KB gzip vanilla vs 294.08 KB gzip R3F for an equivalent empty scene) reconciles with the real numbers: the real 3D-only chunk (233.87 KB) is smaller than the spike's all-in-one R3F measurement (294.08 KB) because real code-splitting moves React/ReactDOM into the shell chunk instead of bundling them with the 3D chunk. The "3D runtime chunk" and "first playable 3D payload" budget rows currently collapse to the same number only because the graybox has zero external assets (`ADR-003`) — they will diverge once textures/models land in later milestones and must be reported separately then.

### Visual evidence

Captured via `npx playwright test capture-evidence` (Playwright screenshot, not the shared browser extension — see Known Issues) at `desktop-chromium` (1920×1080) and `mobile-chromium` (Pixel 7 emulation): initial semantic shell, 3D active state, WebGL-unavailable notice, data-saver notice with "Try 3D" opt-in, reduced motion, loading 3D, recoverable 3D load failure. 14 images total, stored in the session scratchpad (not committed to the repo — regenerate via `EVIDENCE_DIR=<dir> npx playwright test capture-evidence`).

## Known Issues

- The shared Claude-in-Chrome browser extension was too flaky under concurrent sessions to use for evidence capture (repeated "tab not in group" errors); switched to Playwright's own screenshot capability, which is reliable and reproducible via `npm run test:e2e`.
- `playwright.config.ts` originally rebuilt `dist/` inside `webServer.command`, which raced with itself across parallel workers and back-to-back invocations, causing intermittent `ERR_ABORTED` navigations unrelated to any application code. Fixed: build is now a precondition (`npm run test:e2e` chains it), and `workers` is capped at 4 (more concurrent real WebGL contexts than this dev machine has headroom for reproduced the same symptom).
- Two visual-reviewer P2/P3 notes (CTA button styling not yet gold-accented; a thin vertical line artifact in desktop captures, likely a scrollbar/capture artifact) are deferred to `M7`.
- The "GitHub" nav link is real navigation, not a dedicated contact mechanism — a proper contact affordance is deferred pending Juan's decision on what to expose publicly.

## Deviations From Spec

None. This increment stays within `M2`'s scope in `.agents/tasks/MASTER_BACKLOG.md`; no M3+ content (forest/portal/atrium/Zavit/Software Lab) was built ahead of schedule.

## Decisions Required

None blocking. Visual polish items above are recommendations for the `M7` fidelity pass, not gates.

## Recommended Next Milestone

`M3 — 3D Graybox: First Physical Journey`, continuing on `feat/US-010-m2-application-foundation`.

## Git

Branch: `feat/US-010-m2-application-foundation`
Latest commit: `720ed4f`
PR: not yet opened (opens once at the end of the achievable UI Alpha scope, per instruction)
