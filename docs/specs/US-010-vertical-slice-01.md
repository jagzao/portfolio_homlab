# US-010 — Vertical Slice 01

Status: `READY`
Accepted by: —
Accepted on: —
Last transition: `DRAFT → READY` on 2026-09-02

## User Story

As a HomeLab visitor, I want a coherent first journey from forest approach to an interactive Software Engineering Lab architecture, so I experience wonder and credible engineering in one inspectable slice.

## Product Value

Proves HomeLab's core thesis — a living lab that accidentally functions as a portfolio — end to end, in one measurable, auditable slice, before any campus area beyond it is built. Gives recruiters and engineers a complete, honest first impression without requiring the full campus.

## Context

Foundation (`US-001`..`US-004`) is `DONE`. `docs/vision/USER_JOURNEY.md`, `docs/vision/ART_DIRECTION.md`, and `docs/product/SOFTWARE_ENGINEERING_LAB.md` already accept the journey intent, visual language, and Software Lab concept at the product level; this story turns that intent into one bounded, testable, buildable slice with an accepted technical foundation (`ADR-001`..`ADR-005`).

## Refinement Gate

- **Problem:** the accepted journey/visual/product docs describe intent, not observable, buildable, testable behavior with a concrete technical foundation.
- **User:** recruiter-mode and engineer-mode visitors (`docs/vision/USER_JOURNEY.md`); Juan (acceptance); project-lead and specialist reviewers (build/validate).
- **Value:** an inspectable, auditable slice that proves UX, visual identity, engineering credibility, accessibility, and performance before the full campus is built.
- **Behavior:** see Acceptance Criteria below — one observable criterion per journey step, plus cross-cutting accessibility/performance/security criteria.
- **Constraints:** graybox first (`ADR-003`); one entrance portal, no internal teleports; no private Second Brain access from the browser (`ADR-005`); no invented professional claims (AGENTS.md §17); free-tier-only hosting (`ADR-004`).
- **Acceptance:** every criterion below is machine- or human-observable (Playwright, measured metric, or documented visual/keyboard inspection), not a vague intent statement.
- **Risks:** see Risks section.
- **Dependencies:** `ADR-001`..`ADR-005` (technical foundation, this story); `M2` Application Foundation must exist before `M3` graybox; verified Software Lab content is not yet identified (see Risks).

## Scope

- Semantic shell (works without WebGL) covering the full slice's essential content.
- Graybox 3D journey: forest approach → HomeLab exterior → one energy portal → Central Atrium → Zavit placeholder encounter → Guided Mode / Free Exploration choice → bridge over water → Software Engineering Lab entry → one interactive architecture demonstration with `SIMULATE FAILURE`.
- Movement/input model (below), keyboard equivalent, reduced-motion path, mobile-adapted path, WebGL-unavailable fallback.
- Capability detection and degraded-mode behavior per `ADR-002`.
- Public content delivery for whatever verified Software Lab content exists, via the static artifact defined in `ADR-005`; unverified content renders as `PLACEHOLDER — REQUIRES EVIDENCE`, never invented.
- Playwright coverage of the critical path (semantic load → 3D entry → Atrium → Zavit choice → bridge → Software Lab → architecture interaction → failure simulation) plus keyboard, reduced-motion, and WebGL-failure variants.
- Measured evidence against `docs/architecture/PERFORMANCE_BUDGET.md` on the documented desktop/mobile/constrained profiles.

## Out of Scope

Full campus (AI Lab, Robotics Lab, Smart Home, Library, Observatory, Innovation Vault), final visual fidelity beyond graybox (`M7`), live Second Brain integration (`M6`'s real API — Alpha uses the `ADR-005` static artifact only), any paid cloud resource, day/night cycle, sound, and any professional claim not yet verified and approved by Juan.

Within the Software Engineering Lab itself, this slice implements only the Architecture Table and `SIMULATE FAILURE` (`docs/vision/USER_JOURNEY.md` step 7 names five stations). The Engineering Decisions Wall, Technology Wall, Current Workbench, and Flagship Projects are explicitly deferred to `M5 — Software Engineering Lab UI + Interactive Architecture`, not silently dropped.

## Confirmed Journey

`semantic shell → forest approach → HomeLab exterior → one energy portal → Central Atrium → Zavit encounter → Guided Mode / Free Exploration choice → bridge over water → Software Engineering Lab entry → interactive architecture demonstration (SIMULATE FAILURE) → slice endpoint / next-area teaser`

This matches `docs/vision/USER_JOURNEY.md`'s primary journey; no scope split was required — the slice remains independently inspectable end to end.

## Movement and Input Model

**Decision:** hybrid, matching the product-level Guided/Free choice already accepted in `docs/vision/USER_JOURNEY.md`:

- **Guided Mode.** Camera follows a fixed spline with waypoint stops at each journey landmark. Visitor advances with a visible "Continue" control, click/tap, spacebar, or the right-arrow key; can pause, skip a stop, or exit to Free Exploration at any time. Never seizes navigation indefinitely (`docs/vision/USER_JOURNEY.md` Guided Mode constraint).
- **Free Exploration (desktop).** Click/tap-to-walk (nav-mesh point-and-click) is the primary input — chosen over free first-person/WASD because it needs no gaming fluency, matching `MASTER_BACKLOG.md`'s "prefer recruiter usability and accessibility over game-like complexity." Arrow keys/WASD remain available as a supplemental direct-control option for visitors who prefer it.
- **Free Exploration (mobile/touch).** Tap-to-walk plus drag-to-look; no virtual joystick in the Alpha (adds complexity without a measured need). If graybox testing (`M3`) shows tap-to-walk is not comfortable on touch, the fallback is discrete "next landmark" waypoint buttons — an explicit fallback, not silent scope creep.
- **Keyboard equivalent (both modes).** Tab cycles between named landmarks/interactive targets; Enter activates the focused target; Escape opens semantic navigation. This satisfies AGENTS.md §21/§22 without requiring literal free movement from keyboard-only visitors.
- **Semantic/no-WebGL equivalent.** All journey content and the architecture interaction are reachable through ordinary link/button navigation in the semantic shell, independent of the above input schemes.

## Acceptance Criteria

### Journey steps

- [ ] Semantic shell identifies Juan and HomeLab and is interactive before or independent of 3D initialization; no blank loading screen (`docs/vision/USER_JOURNEY.md` step 1).
- [ ] On capable devices, the visitor sees a forest approach and the HomeLab exterior before entering (step 2).
- [ ] Exactly one energy portal exists at the entrance; entering it transitions into the Central Atrium; no other internal teleport exists anywhere in the slice (step 3; AGENTS.md §13).
- [ ] On arrival, Zavit is performing a purposeful activity, then detects the visitor and offers Guided Mode or Free Exploration; the choice is skippable (step 4; `docs/vision/ART_DIRECTION.md` Zavit identity).
- [ ] Atrium landmarks and semantic navigation expose the Software Engineering Lab and an accessible portfolio mode without requiring the visitor to guess (step 5).
- [ ] The route to the Software Engineering Lab crosses a bridge visibly over water, preserving spatial continuity with no cut/teleport (step 6).
- [ ] On entering the Software Lab, the visitor can identify it as Juan's flagship professional area through clear hierarchy, not a simultaneous wall of every technology (step 7; `docs/product/SOFTWARE_ENGINEERING_LAB.md`).
- [ ] The visitor can inspect an `API → QUEUE → WORKER → DATABASE` topology (CACHE optional) and run `SIMULATE FAILURE`, observing service degradation, queue growth, retry, circuit breaker, recovery, and latency/error/recovery-time indicators, all visibly labeled `SIMULATION` (step 7; `docs/product/SOFTWARE_ENGINEERING_LAB.md` architecture simulation concept).
- [ ] After the architecture interaction, the visitor sees an explicit slice endpoint or next-area teaser rather than a dead end (step 8).
- [ ] A visitor can return to orientation without restarting, and a direct link can open the Software Lab's semantic content without replaying arrival (`docs/vision/USER_JOURNEY.md` Recovery and alternate paths).

### Cross-cutting

- [ ] The chosen movement/input model (above) works in both Guided and Free modes on the desktop test profile.
- [ ] Every interactive target and journey step has a keyboard-reachable equivalent per the model above; a keyboard-only Playwright run completes the critical path.
- [ ] `prefers-reduced-motion` removes forced camera sweeps and continuous decorative motion without removing any content or interaction, per `ADR-002`.
- [ ] The mobile-adapted path (`ADR-002` Adapted tier) preserves the full journey narrative and Software Lab content, with reduced visual fidelity where needed.
- [ ] A WebGL-unavailable or WebGL-context-lost condition immediately renders the semantic equivalent with a visible notice; no retry loop blocks content, per `ADR-002`.
- [ ] Entry-time capability detection (`ADR-002`) correctly routes at least one simulated case per tier (full desktop, adapted mobile, data-saver semantic-only, WebGL-absent) in Playwright.
- [ ] No professional claim in the slice is invented; every claim is either sourced from the `ADR-005` static artifact with `VERIFIED` provenance or visibly labeled `PLACEHOLDER — REQUIRES EVIDENCE`.
- [ ] No request from the browser reaches Supabase or any private Second Brain endpoint (network capture proves this; `ADR-005`).
- [ ] All `SIMULATION` telemetry in the architecture demo is visibly and unambiguously labeled as simulated, never presented as production evidence.

## UX / Visual Requirements

Follows `docs/vision/ART_DIRECTION.md` directly: glass/black-metal/subtle-gold palette, restrained holographic UI, no logo soup, focus/hover/active/unavailable/error states on every interactive target, state never communicated by color alone, nature visible from the Software Lab. Graybox phase (`ADR-003`) validates composition/scale/camera/interaction with primitives before any fidelity pass — visual fidelity beyond graybox is `M7`, out of scope here.

## Technical Constraints

- Rendering: React + TypeScript + React Three Fiber, lazy-loaded 3D chunk (`ADR-001`).
- Degraded/mobile/reduced-motion/WebGL-failure behavior per `ADR-002`.
- Graybox-only assets, no compression tooling until a real model triggers it (`ADR-003`).
- Hosting: Cloudflare Pages, deployed from `main` only (`ADR-004`).
- Public content: build-time static artifact behind a typed knowledge-client interface (`ADR-005`).
- No backend/cloud service beyond static hosting is introduced in this story.

## Data Requirements

Software Lab content is limited to whatever the `ADR-005` static artifact contains at implementation time, classified `VERIFIED`/`UNVERIFIED`/`UNKNOWN` per `docs/architecture/CONTENT_MODEL.md`. Architecture-simulation data is synthetic and labeled `SIMULATION`; it is never a data requirement sourced from real systems.

## Security Requirements

No Supabase credentials, endpoints, or query surface in the browser or build output. No unrestricted RAG/search over private knowledge. Network-capture test proves the browser never contacts the private Second Brain, per `docs/architecture/PORTFOLIO_KNOWLEDGE_ARCHITECTURE.md` and `ADR-005`.

## Performance Requirements

`docs/architecture/PERFORMANCE_BUDGET.md`'s numerical targets remain the binding budget, reconciled against `ADR-001`/`ADR-003` as follows: the R3F 3D-runtime chunk spike measured ~294 KB gzip for an empty scene against a 500 KB gzip budget, leaving roughly 200 KB gzip of headroom for the actual graybox scene and interaction code — tight but workable, and it makes per-zone code splitting and the `ADR-003` no-assets-until-triggered rule load-bearing rather than optional. Reference hardware/network profiles, quality-scaling order, and validation protocol are exactly as defined in `docs/architecture/PERFORMANCE_BUDGET.md`; no budget number changes without new measured evidence.

## Dependencies

`ADR-001`..`ADR-005` (this story); `M2 — Application Foundation` must exist before `M3` graybox implementation begins; verified Software Lab content must be identified and approved by Juan before it can replace `PLACEHOLDER` labels (tracked as a risk below, not a blocker to acceptance).

## Risks

- **Verified Software Lab content is not yet identified.** No claim has been sourced/approved yet. Mitigation: `ADR-005`'s placeholder policy — the slice ships and is auditable with `PLACEHOLDER — REQUIRES EVIDENCE` labels wherever content is missing, never fabricated content.
- **R3F bundle headroom is tight (~200 KB gzip) for the 3D chunk.** Mitigation: `ADR-003`'s no-assets-until-triggered rule and mandatory per-zone code splitting; re-measure with a bundle analyzer once the real graybox scene exists (tracked for `M3`/`M8`).
- **Tap-to-walk may prove uncomfortable on touch during graybox testing.** Mitigation: explicit waypoint-button fallback already defined in the Movement and Input Model section, not an open question.
- **Zavit's final fidelity/model is unresolved** (`docs/vision/ART_DIRECTION.md`: "UNKNOWN until an accepted Zavit spec"). Mitigation: Alpha uses a clearly labeled placeholder model per `M4`; this does not block this story's acceptance.

## Testing Requirements

- **Target devices/viewports** (from `docs/architecture/PERFORMANCE_BUDGET.md` Test Profiles): Desktop 1920x1080 (and 1366x768) with hardware acceleration; Mobile 390x844; Constrained profile (reduced motion/data saver/WebGL failure simulated); Network throttled to 4 Mbps down / 150 ms RTT.
- **Playwright E2E matrix:** (1) semantic shell loads and is interactive without 3D; (2) full critical path in Guided Mode on the desktop profile; (3) full critical path in Free Exploration on the desktop profile; (4) mobile-adapted path on the mobile viewport; (5) keyboard-only run of the full critical path; (6) `prefers-reduced-motion` run confirms no forced camera sweeps and no missing content; (7) WebGL forced-unavailable run confirms immediate semantic fallback with a visible notice; (8) data-saver/slow-network run confirms semantic-mode default with a working "Try 3D" opt-in; (9) `SIMULATE FAILURE` run confirms the full degrade/recover sequence and `SIMULATION` labeling; (10) network capture during the full run confirms zero requests to Supabase/private endpoints.
- **Measured evidence required before this story can be marked `IMPLEMENTED`:** production bundle report (semantic shell JS, 3D runtime chunk), Web Vitals (LCP/INP/CLS) on the mobile 4G profile, 60-second frame-time trace on desktop and mobile profiles, JS heap after a 5-minute route and after 5 enter/exit cycles, GPU texture memory estimate — each compared against `docs/architecture/PERFORMANCE_BUDGET.md` and recorded PASS/FAIL/NOT MEASURED, never assumed.
- **Visual inspection required:** real captures (not code review) at the desktop and mobile viewports above, in Guided and Free modes, reduced-motion, and semantic/no-WebGL mode, reviewed by the independent `visual-reviewer` per `.agents/AGENTS.md` §19/§34.

## Implementation Plan

Deferred to implementation time, after `ACCEPTED`. This story's refinement output (journey, movement model, ADR-001..005) is sufficient to scope the plan; the concrete file/component breakdown is written when `M2`/`M3` implementation begins, per `.agents/AGENTS.md` §10.

## State History

| Date | From | To | Authority | Evidence |
|---|---|---|---|---|
| 2026-08-31 | — | DRAFT | project-lead | Foundation roadmap candidate only |
| 2026-09-02 | DRAFT | READY | project-lead | Journey, movement/input model, and `ADR-001`..`ADR-005` refinement complete; measurable Acceptance Criteria defined; performance budget reconciled against `ADR-001`/`ADR-003`; test matrix defined. |
| 2026-09-02 | READY | READY | project-lead | Independent `code-reviewer` pass: no BLOCKER/P0; P1 (stale contradictory line in `PROJECT_STATE.md`) and P2 (Out of Scope missing explicit deferral of Engineering Decisions Wall/Technology Wall/Current Workbench/Flagship Projects to `M5`) fixed; P3 noted for Juan (ADRs presented as project-lead technical-authority decisions, not open questions). Awaiting Juan `ACCEPTED` gate. |
