# HomeLab — Audit-Driven Master Backlog

Status: ACTIVE COORDINATION BACKLOG
Owner: Juan
Project Lead: repository `project-lead`
External Auditor: ChatGPT
Last updated: 2026-09-02

## How to use this file

This is durable execution memory for the agent team. It is not a substitute for accepted User Stories or ADRs.

For every meaningful implementation item:

`BACKLOG ITEM -> refinement -> docs/specs/US-XXX -> Juan ACCEPTED -> branch -> implementation -> independent review -> validation -> PR -> External Audit -> AUDITED -> merge -> DONE`

Do not skip human/audit gates merely because later phases are listed here.

The project-lead should work autonomously inside an accepted scope and stop only at explicit SDD/product/security/cost/public-claim gates.

---

# M0 — Foundation Closeout

## Goal

Close PR #1 cleanly before application/UI implementation begins.

## Current state

Foundation audit fixes are present on `foundation/sdd-agent-workflow`; External Re-Audit is required.

## Required completion

- [x] External Auditor re-audits current PR #1 head. (review `5080741521`; PASS comments `5089914053`, `5089927962`)
- [x] No BLOCKER/P0 foundation findings remain.
- [x] P1 findings required for Foundation are closed or explicitly deferred with rationale. (see `docs/audits/AUDIT-2026-09-01-pr1-review-5080741521.md`)
- [x] US-001..US-004 move from `IMPLEMENTED` to `AUDITED` only after External Audit confirms this. (commit `9851c27`)
- [x] PR #1 becomes merge-eligible.
- [x] Merge according to `docs/architecture/DELIVERY_WORKFLOW.md`. (merged as `5e610e4` on 2026-09-02)
- [x] After merge, durable story state is reconciled to `DONE` without bypassing traceability. (`docs/foundation-done-reconciliation`)
- [x] `.agents/memory/PROJECT_STATE.md` is updated to identify the new active milestone. (`M1`)

## Stop condition

Foundation is `AUDITED` and merged. M1 is now active; do not begin M2+ implementation until `US-010` is `ACCEPTED` by Juan.

---

# M1 — US-010 Refinement and Technical/UX Decisions

## Goal

Turn `US-010 — Vertical Slice 01` from a broad DRAFT into a bounded, testable first UI/3D milestone.

## 1. Journey refinement

Define observable behavior for:

- semantic shell;
- approach/entry;
- forest/exterior reveal;
- one energy portal;
- Central Atrium;
- Zavit first encounter;
- Guided Mode vs Free Exploration;
- bridge to Software Engineering Lab;
- Software Lab first interaction;
- slice endpoint / next-area teaser;
- exit/recovery/deep-link behavior.

The first visitor should not need gaming knowledge to understand how to proceed.

## 2. Movement/input decision

Evaluate at least:

- free first-person/WASD;
- click/tap-to-walk;
- guided camera/spline with optional free exploration;
- hybrid approach.

Prefer recruiter usability and accessibility over game-like complexity.

Document selected model and fallback keyboard/mobile behavior.

## 3. Rendering stack ADR + executable spike

Compare at least:

- direct Three.js;
- React + React Three Fiber.

Assess:

- bundle/runtime cost;
- asset lifecycle/disposal;
- testability;
- React/semantic UI integration;
- accessibility overlays;
- performance instrumentation;
- maintenance/agent ergonomics.

Do not select a stack from preference alone.

## 4. Asset pipeline ADR

Decide initial strategy for:

- GLTF/GLB;
- Meshopt/Draco when justified;
- KTX2/textures when justified;
- asset ownership/licenses;
- loading boundaries;
- placeholder/graybox pipeline;
- source vs optimized asset storage.

## 5. Hosting baseline decision

Choose the cheapest defensible baseline for alpha.

Do not choose Azure/AWS merely to show a logo. Compare static/free/scale-to-zero options. If a provider is selected, document reason, cost and exit path.

## 6. Public content delivery decision for alpha

Choose one safe first-slice mechanism:

- sanitized static public artifact;
- public read model;
- narrow Portfolio Knowledge API.

Direct browser access to private Second Brain is prohibited.

The alpha may use explicitly marked PLACEHOLDER/SIMULATION content while public projection is not implemented, but must not ship invented professional claims.

## 7. Degraded/mobile decision

Define thresholds/behavior for:

- full 3D desktop;
- adapted 3D;
- semantic mode;
- WebGL unsupported/failure;
- reduced-motion;
- data saver / constrained network.

## Required output

- [x] US-010 fully refined with measurable Acceptance Criteria. (`docs/specs/US-010-vertical-slice-01.md`, `READY` since 2026-09-02)
- [x] required ADRs created and accepted according to SDD. (`docs/adr/ADR-001`..`ADR-005`, project-lead technical authority)
- [x] provisional performance budget reconciled with chosen approach. (`docs/architecture/PERFORMANCE_BUDGET.md` reconciliation note)
- [x] visual evidence target viewports/devices defined. (`US-010` Testing Requirements)
- [x] test matrix defined. (`US-010` Testing Requirements)
- [ ] no implementation begins until US-010 is `ACCEPTED` by Juan. **BLOCKED ON JUAN — awaiting explicit acceptance of scope, acceptance criteria, ADR decisions, and risks/costs presented at the M1 gate.**

---

# M2 — Application Foundation + Semantic UI

## Goal

Build a production-quality shell that remains useful without WebGL.

This is real UI work and must be visually reviewed.

## Functional scope

- application bootstrap;
- routing/deep links if needed;
- semantic portfolio shell;
- capability/WebGL detection;
- loading state;
- recoverable error state;
- semantic navigation;
- reduced-motion handling;
- keyboard accessibility;
- mobile/adapted presentation;
- accessible contact/navigation path;
- 3D entry/loading boundary;
- public content adapter interface (not private Second Brain access).

## Visual shell

Create a restrained premium UI matching the HomeLab art direction:

- dark/black base;
- subtle gold accents;
- white information hierarchy;
- green active state;
- restrained red robotics/warning state;
- typography optimized for readability;
- minimal HUD/panels rather than game UI clutter;
- no giant permanent menus over the world;
- no logo soup.

Essential text should remain semantic HTML where practical rather than baked into textures.

## Required states

At minimum visually validate:

- initial semantic shell;
- loading 3D;
- normal desktop;
- mobile/adapted;
- reduced motion;
- WebGL unavailable;
- recoverable 3D load failure.

## Quality gates

- [ ] lint/typecheck/build.
- [ ] basic unit/integration coverage where valuable.
- [ ] Playwright semantic navigation smoke.
- [ ] keyboard flow.
- [ ] reduced-motion test.
- [ ] visual captures at accepted viewports.
- [ ] no console/runtime errors.
- [ ] bundle baseline measured.

---

# M3 — 3D Graybox: First Physical Journey

## Goal

Prove that HomeLab feels like a coherent physical place before high-fidelity art.

## Required graybox world

`forest approach -> HomeLab exterior -> main energy portal -> Central Atrium -> bridge -> Software Engineering Lab`

## Graybox priorities

- scale;
- camera height/FOV;
- movement comfort;
- path readability;
- collision boundaries;
- sightlines;
- loading boundaries;
- orientation landmarks;
- interaction distance;
- transition pacing;
- no internal teleportation.

## Required environmental concepts

Even in graybox, spatial plan must reserve/represent:

- campus over water;
- glass-pavilion silhouettes;
- bridges;
- central tree/vegetation zone;
- water visibility;
- transparent-roof intent;
- external nature sightlines.

Do not spend alpha time on final vegetation/model detail until scale and traversal pass.

## Portal

There is exactly one primary energy portal at entry.

It should feel like a transition threshold, not a reusable navigation gimmick.

## Validation

- [ ] no dead ends/collision traps on primary route;
- [ ] recruiter can identify next destination without trial-and-error;
- [ ] route works through accepted input model;
- [ ] semantic/direct navigation offers equivalent content access;
- [ ] reduced-motion path avoids forced cinematic camera sweeps;
- [ ] representative FPS/frame-time captured even for graybox;
- [ ] visual reviewer receives actual captures/video evidence.

---

# M4 — Zavit v1

## Goal

Make Zavit a memorable host without blocking the portfolio experience.

## First-slice scope

Use a placeholder/custom low-complexity model if final reference/model is unavailable.

Required recognizable traits:

- black body;
- white belly screen;
- illuminated eyes;
- head buttons;
- red pincer/claw hands;
- retro-futuristic/nostalgic identity.

## Behavior

On visitor arrival, Zavit is already doing a purposeful activity.

Then:

1. detects visitor;
2. transitions eye/state;
3. greets briefly;
4. offers Guided Mode vs Free Exploration;
5. does not trap visitor in dialogue;
6. can be skipped;
7. preserves keyboard/mobile/reduced-motion alternatives.

## UI integration

Belly screen/content must remain legible. If text is essential, expose an equivalent semantic representation.

## Future fidelity blocker

High-fidelity final model may require a stronger visual/photo reference from Juan. Do not fabricate childhood-product details beyond the accepted description.

---

# M5 — Software Engineering Lab UI + Interactive Architecture

## Goal

Deliver the first feature that proves the portfolio is more than visual spectacle.

## Entry experience

The visitor crosses the bridge and understands immediately that this is Juan's strongest professional area.

Use a clear hierarchy rather than displaying every technology at once.

## Architecture Table v1

Implement an interactive demonstrator using a clearly labeled `SIMULATION` topology such as:

`API -> QUEUE -> WORKER -> DATABASE`

with CACHE only where it improves the demonstrated concept.

The experience must explain engineering meaning, not merely animate boxes.

## Interactions

Allow visitor to inspect components and run:

`SIMULATE FAILURE`

Expected visual/semantic sequence can include:

- service degradation/failure;
- queue depth growth;
- retry behavior;
- circuit breaker state;
- recovery;
- latency/errors/recovery-time indicators.

All generated telemetry is `SIMULATION`, never claimed as production metrics.

## Engineering Decisions v1

Include at least one inspectable trade-off, for example:

- sync vs async;
- cache vs database;
- SQL vs NoSQL;
- strong vs eventual consistency;
- optimistic vs pessimistic concurrency.

If tied to Juan's actual experience, claim/context must come from verified publishable data. Otherwise label it as a generic engineering scenario.

## Technology Wall v1

Display technology classification without logo soup.

Conceptual categories:

- CORE;
- PRODUCTION_EXPERIENCE;
- ACTIVE_EXPLORATION.

Do not visually imply equal expertise.

Technology selection should highlight related public projects/evidence when public projection is available.

## Current Workbench v1

Display current experiments from safe public data when available. If unavailable, use explicit placeholders or omit rather than invent.

## Semantic equivalent

Every essential architecture concept, failure sequence, decision, and professional claim must be available in accessible semantic UI.

## Recruiter target

A recruiter should understand Juan's primary engineering identity and core stack quickly without having to complete a game.

---

# M6 — Public Portfolio Projection v1

## Goal

Connect UI content to an evolving, safe projection of the private Second Brain.

This milestone may begin earlier as a spike, but public integration must not weaken the trust boundary.

## Requirements

- no private Supabase credentials in browser/build output;
- no browser query to private Second Brain tables;
- no unrestricted private RAG/search;
- public stable IDs do not reveal private DB IDs;
- factual claims require `VERIFIED + PUBLISHED`;
- publication is allowlisted/field-scoped;
- withdrawal/revocation path exists;
- rejected/private raw content never enters public logs/errors/cache;
- contract/forbidden-field tests exist.

## Minimum public content useful for first UI

- Profile;
- Capability/Technology classifications;
- at least one safe Project/Experience record if approved;
- Exploration/Current Workbench items when publishable;
- safe evidence references where approved.

## Dynamic behavior

The architecture should permit future Second Brain updates to reach HomeLab after verification/publication without rewriting Three.js components.

## Cost rule

Prefer the simplest safe design. Do not create an API if a sanitized static/public artifact meets freshness and withdrawal requirements.

---

# M7 — Visual Fidelity Alpha

## Goal

Raise the validated graybox into the memorable visual language already accepted, without compromising performance/readability.

## Environment priorities

- glass architecture;
- black structural metal;
- subtle gold accents;
- water and reflections;
- forest/mountain/nature sightlines;
- interior vegetation;
- vertical gardens;
- selected fruit-bearing plants;
- transparent roof/skylight;
- sky/day state;
- restrained night stars/deep-sky state;
- central atrium tree concept;
- premium Software Engineering Lab lighting.

## UI/tech aesthetics

- restrained holographic interfaces;
- readable architecture diagrams;
- consistent interaction states;
- technology labels integrated as technical panels/context, not advertisements;
- Zavit screen/eye states coherent with UI language.

## Avoid

- excessive bloom;
- excessive particles;
- constant motion everywhere;
- neon overload;
- illegible glass-on-glass UI;
- fake tiny code text as decoration;
- giant logo walls;
- copied visual identity from existing movie/game IP.

## Day/night

Do not implement expensive complete dynamic lighting if a cheaper convincing approach is better for alpha. Manual mode is acceptable. Real-time clock is optional and not a release requirement.

## Sound

Ambient water/wind/nature/robot sounds are optional and must never be required to understand content. Respect reduced-motion/autoplay/accessibility considerations.

---

# M8 — Quality, Performance, Accessibility and UI Audit Readiness

## Goal

Produce an evidence-backed alpha ready for External Audit.

## Code review

Independent `code-reviewer` must inspect:

- architecture;
- correctness;
- resource lifecycle;
- cleanup/disposal;
- state management;
- content boundary;
- security;
- test quality;
- regressions;
- traceability.

## Visual review

Independent `visual-reviewer` requires real evidence, including at least:

- desktop main journey captures;
- mobile/adapted captures;
- reduced-motion evidence;
- semantic/no-WebGL mode;
- Atrium;
- Zavit encounter;
- Software Engineering Lab;
- architecture simulation normal/failure state.

It must compare implementation against accepted art/product specs.

## Performance review

Independent `performance-reviewer` must measure:

- production bundle sizes;
- initial JS/CSS;
- 3D runtime chunk;
- first-playable payload;
- asset inventory;
- LCP/INP/CLS where applicable;
- FPS/frame time on documented target devices;
- memory/heap behavior;
- renderer resource counts/GPU estimate where available;
- repeated enter/exit cleanup;
- mobile/degraded thresholds.

No `PASS` without measurements.

## E2E flows

At minimum:

1. semantic shell loads;
2. visitor can enter 3D when supported;
3. visitor reaches Atrium;
4. Zavit guided/free decision works or can be skipped;
5. visitor reaches Software Engineering Lab;
6. architecture interaction works;
7. failure simulation works and is visibly labeled `SIMULATION`;
8. keyboard alternative works;
9. reduced-motion path works;
10. WebGL failure/degraded path preserves content;
11. mobile path remains usable.

## Security/content validation

- secret scan;
- browser network inspection proves no private Second Brain access;
- public content contract test;
- forbidden-field/private-ID scan;
- no unsupported professional claims.

---

# M9 — External Audit: UI Alpha

## Goal

Stop development and hand the complete first UI/3D vertical slice to ChatGPT for external review.

## Required handoff

Project Lead must provide:

- branch;
- commits;
- PR;
- stories/ADRs;
- implemented scope;
- changed files;
- screenshots/captures/artifacts or reproducible local instructions;
- validation commands/results;
- code reviewer findings;
- visual reviewer findings;
- performance reviewer measurements;
- accessibility evidence;
- security/public-content evidence;
- known issues;
- spec deviations;
- decisions deferred;
- explicit list of placeholders;
- exact professional claims shown publicly and their publication/evidence provenance.

## Stop condition

Do not merge the UI alpha PR.

Output exactly a clear status containing:

`READY FOR EXTERNAL AUDIT — UI ALPHA`

The External Auditor will review GitHub and may emit BLOCKER/P0/P1/P2/P3 findings. Resolve required findings through the normal SDD loop.

---

# Deferred Beyond First UI Alpha

Do not let these expand current scope unless an accepted story requires them:

- full AI Lab;
- full Robotics Lab;
- full Smart Home Lab;
- Library;
- Observatory implementation;
- Innovation Vault implementation;
- complete high-fidelity campus;
- complex weather system;
- multiplayer/social features;
- unrestricted conversational agent;
- expensive multi-cloud infrastructure;
- production-grade robot/IoT hardware integration.

They belong to later milestones after the first vertical slice proves UX, visual identity, engineering credibility, accessibility, and performance.

---

# Project Lead Execution Rule

Always execute the earliest unblocked milestone.

If a milestone is waiting on External Audit or Juan acceptance, do not skip forward into implementation. Use the wait period only for safe discovery, measurement, drafting, risk analysis, or clearly non-implementing refinement that does not bypass the gate.

When a gate is satisfied, update `.agents/memory/PROJECT_STATE.md` and continue from this backlog rather than requiring a new giant prompt.
