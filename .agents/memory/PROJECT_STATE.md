# HomeLab — Durable Project State

Last updated: 2026-09-04
Owner: Juan
External Auditor: ChatGPT

## Purpose

This file is coordination memory for agents. It summarizes current state so a new agent/session can continue without reconstructing conversation history.

It does **not** replace accepted product specs, ADRs, or `.agents/AGENTS.md`. When a conflict exists, follow the precedence defined in `.agents/AGENTS.md`.

## Repository

- Repo: `jagzao/portfolio_homlab`
- Foundation PR: `#1`
- Foundation branch: `foundation/sdd-agent-workflow`
- Foundation base: `main`

## Current gate

Foundation is closed. `M0 — Foundation Closeout` is complete:

- US-001..US-004 moved `IMPLEMENTED → AUDITED` on 2026-09-02 (commit `9851c27`), citing External Re-Audit PASS (review `5080741521` CHANGES REQUIRED resolved; PASS comments `5089914053`, `5089927962` on head `6b5a4789`).
- PR #1 merged to `main` as `5e610e4` on 2026-09-02.
- `main` synced locally; `docs/foundation-done-reconciliation` closes US-001..US-004 `AUDITED → DONE` (trivial/no-behavior-change exception per `docs/architecture/DELIVERY_WORKFLOW.md`) since the merge itself is the only remaining DONE criterion and no new audit is required for pure lifecycle bookkeeping.

GitHub could not record a formal `APPROVE` from the connected account because the PR belongs to the same GitHub identity; the External Audit PASS is recorded as PR review comments `5089914053` and `5089927962`.

`M1 — US-010 Refinement` is complete. `US-010` reached `READY` (2026-09-02), then Juan explicitly `ACCEPTED` scope/AC/ADR-001..005 in chat ("si adelante con todo"). PR #3 merged to `main`.

`M2 — Application Foundation + Semantic UI` is complete on branch `feat/US-010-m2-application-foundation`:

- React + TypeScript + Vite + React Three Fiber app (per `ADR-001`) with a real semantic shell, ADR-002 capability-detection boundary, ADR-003 graybox 3D entry, and an ADR-005 static knowledge-client interface proven end-to-end via `ProfileSummary`.
- Independent `code-reviewer`, `visual-reviewer`, and `performance-reviewer` passes all complete: no BLOCKER/P0 from any; code-reviewer's one P1 (missing recoverable-failure test coverage) and several P2s fixed in `750821b`.
- Validation: typecheck/lint/build clean; 17 unit tests and 24 E2E tests (desktop+mobile) pass; production bundle measured (shell 62.65 KB gzip, 3D chunk 233.87 KB gzip, both under `PERFORMANCE_BUDGET.md`); 7 required visual states captured at both viewports.

Per the explicit UI Alpha instruction: milestones `M2`–`M9` accumulate on this **one** branch with an internal `IMPLEMENT → BUILD → TEST → RUN → VISUAL INSPECTION → MEASURE → REVIEW → FIX → RETEST` loop (specialist reviewers = the required independent internal review) at each milestone; a single PR opens only once, at the end of the achievable Alpha scope, for External Audit. No merge before that audit.

`M3 — 3D Graybox: First Physical Journey` is complete on the same branch:

- Full graybox route: forest → exterior → portal → atrium → bridge → Software Lab entry, primitives only (`ADR-003`). Click-to-walk + keyboard landmark HUD + arrow keys, path-and-endpoint collision, semantic `JourneyList` equivalent.
- Independent `code-reviewer`/`performance-reviewer`: no BLOCKER/P0; found P1s (missed mid-path collision, per-frame React churn, weak keyboard test) and P2s, all fixed in `d54562c`.
- Independent `visual-reviewer`: took **3 rounds** — round 1 found BLOCKER (empty Lab zone) + 3×P0 (Atrium FOV overflow, Portal not framed, Bridge near-black) + P1 (Exterior indistinct); round 2 fixed 2 of 3 P0s; round 3 (lighter sky/fog, real Lab doorway geometry, wider mullioned Exterior facade) resolved everything. See `docs/handoffs/HANDOFF-2026-09-03-m3-graybox-journey.md` for the full trail — worth reading before trusting a first-pass visual review as sufficient on later milestones.
- 25 unit + 44 E2E tests pass; real frame-time sample (~60fps avg, p95 ~18ms on both viewport projects — confirms the code path, not real mobile-hardware headroom).

`M4 — Zavit v1` is complete on the same branch:

- Graybox Zavit at the Central Atrium (black body, white belly, state-colored eyes, head buttons, red claw hands, per `ART_DIRECTION.md` — nothing fabricated beyond the accepted description). Proximity-triggered greeting offers Guided Mode / Free Exploration / Skip, never retriggers, never traps navigation. Guided Mode adds a "Continue" control (click/Space/right-arrow) walking the route stop by stop.
- Independent `code-reviewer` found a real **P0**: the keyboard-bound guided-advance handler closed over `guidedIndex` at mount time (empty-dep listener), so Space/ArrowRight always re-targeted the same landmark while the mouse button worked — fixed via a ref read at call time, with a regression e2e test (two consecutive keyboard advances land on different stops) that would have caught it. Also fixed: Zavit missing from the keyboard-movement obstacle list (click-to-walk had it, arrow keys didn't), a timer race (greeting could pop up somewhere the visitor already walked away from), a fragile landmark-index fallback, and dialog focus management (WCAG 2.4.3/4.1.2).
- Independent `visual-reviewer` found one **P1**: Zavit's position fell almost entirely outside the horizontal FOV on mobile/portrait viewports — repositioned. Also fixed proactively: red hands sat near the floor with nothing else nearby, reading as feet — added a base and raised the arms.
- 32 unit + 62 E2E tests pass (both self-verified against fresh evidence after each fix round).

`M5 — Software Engineering Lab: Architecture Table + SIMULATE FAILURE` is complete (the explicit UI Alpha minimum; Engineering Decisions Wall/Technology Wall/Current Workbench remain out of scope pending Juan's verified content):

- `API → QUEUE → WORKER → CACHE → DATABASE`, inspectable, with a labeled `SIMULATION` failure/recovery sequence explaining real engineering reasoning (queue absorbing backpressure, retries, circuit breaker opening/closing). One component works both in the semantic shell and as a 3D overlay.
- **Two rounds of real bugs**, worth remembering for how later milestones get reviewed: round 1's "fix" for a duplicate-dialog P1 (shared context) was itself still broken — both mount points independently rendered the panel — and the regression test for it passed anyway on what looks like a `toHaveCount` timing fluke. Caught only by writing a broader full-critical-path e2e test with stricter locators, confirmed by screenshot. Real fix: the panel renders exactly once, globally, as a real fixed-position modal. A second focused review then found the modal didn't actually block background 3D movement despite `aria-modal="true"` — fixed by gating the movement listener on any overlay being open.
- Also closed, found while auditing every `US-010` AC before marking it `IMPLEMENTED`: no slice-endpoint teaser existed, no single keyboard-only full-critical-path test existed, no test proved zero browser requests to Supabase, and the simulation never mentioned "retry" despite the AC listing it.
- 40 unit + 62 E2E tests pass.

**`US-010` moves `ACCEPTED → IMPLEMENTED`** — every Acceptance Criterion checked with file/test evidence in the spec itself. `AUDITED`/`DONE` await the `M9` External Audit at the end of the achievable UI Alpha scope.

Per-milestone handoff notes live under `docs/handoffs/`; the durable UI Alpha handoff is finalized at `M9`.

**`M6 — Public Portfolio Projection v1` is blocked, not skipped.** Its own scope requires real `VERIFIED + PUBLISHED` content (Profile, at least one Project/Experience record) sourced from Juan's private Second Brain — this session has no Second Brain access, and AGENTS.md §17/§36 forbid inventing it or unilaterally deciding what crosses the publication boundary. `ADR-005` already anticipated this: Alpha ships on the static-empty artifact, content arrives later once Juan supplies/approves it. Per `MASTER_BACKLOG.md`'s own Project Lead Execution Rule ("do not skip forward into implementation" when blocked, but also don't stall on a blocked gate), moving to the next actually-unblocked milestone.

`M7 — Visual Fidelity Alpha` is complete on the same branch:

- Hemisphere sky/ground lighting, manual day/night toggle with restrained night stars, glass/water materials, vertical-garden leaf accents, multi-lobe atrium tree canopy — procedural fidelity within `ADR-003`'s primitives-only constraint, no new asset pipeline.
- Self-investigating a visual-reviewer note found a real, non-obvious bug: the corridor's single opaque ground plane had been sitting on top of both water planes since `M3` — water was never actually visible, in any prior milestone's evidence, despite screenshots being reviewed and passed at the time. Fixed by reordering the Y-layering. **Worth remembering**: a visual review pass can miss things that are only "not there" rather than "wrong," and evidence gets re-approved without anyone noticing an element was silently absent the whole time.
- code-reviewer's flag of an unmeasured `meshPhysicalMaterial` rollout caught a real signal (desktop p95 briefly measured at ~28ms vs. the 20ms budget), though follow-up measurement showed the dev machine has genuine 18-31ms run-to-run variance — applied the budget's prescribed mitigation (fewer clearcoat surfaces, fewer vine draw calls) regardless of how much was signal vs. noise.
- 40 unit + 50 E2E tests pass.

`M8 — Quality, Performance, Accessibility and UI Audit Readiness` is complete on the same branch:

- Holistic (whole-alpha, M2-M7) independent `code-reviewer`, `visual-reviewer`, `performance-reviewer` passes, run in parallel with fresh context, no self-review.
- `code-reviewer` P1: `ZavitGreeting.tsx` declared `aria-modal="true"` with no focus-trap/Escape, unlike `ArchitecturePanel.tsx` — fixed, mirroring the existing pattern, with new Escape/Tab-wrap e2e regression tests.
- `code-reviewer` P2: Guided Mode/LandmarkHud jump movement never obstacle-checked its path (unlike click-to-walk/keyboard nudge) — the Atrium tree sat directly on the Atrium→Bridge straight line. Fixed by moving the obstacle off the corridor centerline (documented as a tradeoff in `landmarks.ts` rather than adding full path-routing), with a new unit test asserting every real consecutive-landmark pair stays clear.
- `visual-reviewer` found 3 P1s across 33 fresh captures: Atrium water never actually visible (tree blocked the view + landmark stop point kept water outside camera FOV — fixed by repositioning both), the in-3D Architecture Table capture showing the wrong location (test clicked before the walk finished — fixed by waiting for real arrival and scoping to the right button), and mobile captures showing Zavit's greeting stuck open over unrelated zones.
- Investigating that last P1 (not either reviewer) surfaced a real, previously-undetected bug: the Zavit greeting and the Architecture Table could be open **simultaneously** — two independent `aria-modal="true"` dialogs stacked, reproducible on desktop too under load, not mobile-specific. Fixed by making the two modals mutually exclusive in the state machine (this is the third time in this project a review finding led to discovering a deeper bug than the one originally reported — see the M5 and M7 notes above; worth continuing to treat "looks fine but let me check anyway" as the default).
- `performance-reviewer`: bundle/delivery budgets all PASS with large margins; heap-delta clean (+0.4MB/5 cycles); added real INP-proxy and long-task measurements (previously entirely unmeasured); freshly re-measured desktop 3D frame time (not just carried forward from M7) at 21.3-25.1ms p95 across 4 samples — **consistently over the 20ms budget**, though the dev machine had ~37 concurrent Chrome processes from unrelated sessions during measurement, which plausibly inflates this. Reported honestly as an inconclusive/marginal-fail needing a real quiet-device re-measurement, not waved off. Sustained 5-minute heap and real GPU/renderer profiling remain documented gaps (not fabricated as covered).
- Investigated the apparent ~34-minute E2E hang (2 mobile-chromium tests) `performance-reviewer` was skeptical of: isolated reruns passed in seconds, and a full 114-116 test suite run afterward completed cleanly in 4.4-4.5 minutes — strong evidence of transient system contention, though the exact mechanism for a bounded 8s/30s assertion hanging 34 minutes wasn't fully diagnosed.
- Security/content validation: secret scan clean, network-isolation proof already covered by `critical-path.spec.ts`, public-content contract already tested (`client.test.ts`), no unsupported claims found.
- 41 unit + 116 E2E tests pass (desktop+mobile, final full run 2026-09-04).

`M9 — External Audit: UI Alpha` is complete: PR #4 opened (`feat/US-010-m2-application-foundation` → `main`, https://github.com/jagzao/portfolio_homlab/pull/4) with the full handoff (scope, changed files, validation, all three reviewers' findings and fixes, performance measurements, accessibility/security evidence, professional-claims provenance, known issues, deferred decisions, placeholders). **Not merged**, per instruction — development stops here pending External Audit.

**Stopped for External Audit. No active milestone until Juan or the External Audit reviews PR #4.** M10+ (M6 unblock once real content is supplied, or further UI Alpha iteration per audit findings) resumes only after that review.

## Foundation audit history

Initial External Audit result: `CHANGES REQUIRED`.

Required fixes included:

- make specialist reviewers genuinely read-only;
- prove native Task/subagent invocation end-to-end;
- make lifecycle headers/checklists consistent;
- fix canonical `docs/architecture/CONTENT_MODEL.md` reference;
- strengthen foundation validation;
- document the OpenCode `tools.invalid` diagnostic without inventing a fix.

Those findings were corrected and re-audited. External Re-Audit result: `PASS`.

## Product identity

HomeLab is a living personal research laboratory that also functions as Juan's professional portfolio. It is not a CV rendered in Three.js.

The experience must make two audiences believe two things at once:

- recruiter: Juan knows and uses a broad modern engineering stack and builds impressive systems;
- senior engineer: the visual experience is backed by credible engineering, trade-offs, testing, performance, security, and evidence.

## World identity

- one continuous walkable world;
- only one primary energy portal: the entrance;
- forest/nature approach;
- campus/pavilions over water;
- bridges connect sections;
- glass architecture, black metal, subtle gold;
- nature remains visible inside professional spaces;
- vertical gardens and fruit-bearing plants are part of the environment;
- transparent roofs expose sky by day and stars/deep sky by night;
- no internal teleport portals unless a future accepted spec changes this.

Planned areas:

- Central Atrium;
- Software Engineering Lab first;
- AI Lab;
- Robotics Lab;
- Smart Home Lab;
- Library;
- Observatory;
- Innovation Vault / underground Batcave;
- gardens, water, bridges, second floor.

Future areas are not automatically in scope for the first UI alpha.

## Zavi and Zavit

These are different concepts.

- **Zavi**: Juan's private AI / Second Brain ecosystem.
- **Zavit**: the HomeLab robot butler/host.

Exact robot identity for Zavit:

- mostly black body;
- white belly screen;
- illuminated expressive eyes whose color changes by state;
- buttons on the head;
- red claw/pincer hands;
- retro-futuristic, nostalgic, friendly, intelligent;
- should be doing something purposeful when the visitor arrives, not waiting like a static receptionist.

Final high-fidelity proportions/model remain pending a stronger visual reference from Juan. A clearly labeled placeholder is acceptable in the first slice.

## First professional area

Software Engineering Lab is the first flagship area.

Concepts already accepted at product level:

- Architecture Table;
- Engineering Decisions Wall;
- Technology Wall;
- Current Workbench;
- Flagship Projects;
- architecture/failure simulation;
- semantic equivalent outside WebGL.

Core professional direction includes `.NET`, C#, Azure, Cloud, SQL Server, PostgreSQL, React, and TypeScript. Other technologies must appear according to verified public evidence. Python must not be visually presented as equal mastery without evidence; current product direction treats it as active/growing exploration unless public evidence supports a stronger classification.

## Second Brain boundary

Supabase Second Brain project: `oweqrcmxmmxzyahyleap`.

Never expose the private Second Brain directly to browser visitors or Zavit.

Required boundary:

`Private Second Brain -> verification/sanitization/publication -> Public Portfolio Projection -> HomeLab/Zavit -> Visitor`

Only `VERIFIED + PUBLISHED` claims may be presented as factual professional claims. No unrestricted public RAG/search against private knowledge.

The public projection must evolve as Juan's Second Brain evolves, but freshness must never override privacy or publication approval.

## UI alpha target

The first audit-ready executable UI should be an inspectable vertical slice, not the whole campus.

Target journey:

`semantic shell -> forest approach -> HomeLab exterior -> one energy portal -> Central Atrium -> active Zavit placeholder -> guided/free choice -> bridge over water -> Software Engineering Lab -> interactive architecture/failure demonstration`

The slice must include a usable semantic/mobile/reduced-motion fallback. Essential professional content cannot be trapped inside WebGL.

## Visual target

Use the accepted concept direction:

- premium futuristic research facility;
- warm and inhabited rather than sterile;
- strong nature integration;
- black + subtle gold + green + white with restrained red robotics accents;
- glass, water, reflections, vegetation;
- restrained holographic UI;
- no logo soup;
- no excessive bloom/particles/neon;
- visual hierarchy and readability before effects.

## Technical direction

**Decided:** React + TypeScript + React Three Fiber, per `docs/adr/ADR-001-rendering-framework.md`, backed by a real bundle-size spike (129.37 KB gzip vanilla Three.js vs 294.08 KB gzip React Three Fiber for an equivalent minimal scene). This is no longer an open candidate.

Do not add ASP.NET Core, PostgreSQL, Python, Azure, AWS, or other backend/cloud services simply to display technologies. Each service must support an accepted capability and have a defensible cost/security reason.

## Performance/accessibility principles

- semantic shell loads independently of 3D;
- 3D is progressive enhancement;
- mobile may use adapted 3D or semantic mode;
- reduced motion must preserve information;
- keyboard-accessible equivalents are required;
- WebGL failure cannot block portfolio content;
- measure before optimization;
- provisional budgets live in `docs/architecture/PERFORMANCE_BUDGET.md`.

## Coordination backlog

The durable execution roadmap is `.agents/tasks/MASTER_BACKLOG.md`.

Project Lead startup must read:

1. `.agents/AGENTS.md`;
2. this file;
3. `.agents/tasks/MASTER_BACKLOG.md`;
4. relevant accepted specs/ADRs;
5. current branch/PR state.

The roadmap is coordination input. Before meaningful implementation, convert/refine the active item into an accepted `docs/specs/US-XXX-*.md` as required by SDD.
