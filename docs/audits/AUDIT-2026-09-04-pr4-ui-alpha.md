# External Audit — PR #4 UI Alpha

Status: `CHANGES REQUIRED`
External Auditor: ChatGPT
Audit date: 2026-09-04
Implementation head audited: `2547e744304c293b87339143bbe27c668056b2ce`
PR: `#4 — HomeLab UI Alpha — US-010 Vertical Slice 01 (M2-M8)`

Coordination-only commits added by the External Auditor after inspecting the implementation:

- `.agents/rules/ANALYSIS_DELIVER_CONTRACT.md`
- `.agents/project-lead.md` reference to the contract
- expanded `docs/specs/US-TEMPLATE.md`
- this audit document

Those coordination changes do not constitute fixes for the product findings below.

## Executive result

The branch demonstrates strong engineering progress: real React/R3F implementation, semantic fallback, a coherent first physical route, Zavit interaction, deterministic architecture simulation, useful unit/E2E coverage, accessibility fixes, content-boundary discipline, and honest recording of several performance gaps.

However the PR is **not merge-ready** and `US-010` must not remain represented as fully `IMPLEMENTED` while mandatory accepted criteria/gates are still unmet or unmeasured. Several milestone-completion claims also disagree with the durable backlog/spec.

No merge until required P0 findings are resolved and re-audited.

---

# P0 — Required before this UI Alpha can be AUDITED

## P0-01 — US-010 was marked IMPLEMENTED before its mandatory validation contract was satisfied

`US-010` requires, before `IMPLEMENTED`, mobile-4G Web Vitals, 60-second frame traces, a 5-minute-route heap measurement, five enter/exit cycles, GPU texture-memory estimate, and comparison against the accepted performance budget.

Current M8 evidence explicitly reports:

- LCP/CLS measured with methodology different from the required mobile-4G/p75 profile;
- INP only as a proxy;
- desktop p95 frame time `21.3–25.1 ms`, above the accepted `<=20 ms` budget in every fresh sample;
- sustained 5-minute-route heap: not measured;
- real GPU/renderer/texture-memory profiling: not measured.

Required fix:

1. Reconcile story state honestly while gates are open.
2. Re-run mandatory performance validation using the accepted methodology or formally refine/re-accept the spec before changing a requirement.
3. A budget FAIL cannot become PASS because the workstation was contended; either produce clean evidence or optimize and remeasure.
4. Record raw/reproducible evidence in the final handoff.

## P0-02 — Accepted movement/input model is only partially implemented

The accepted `US-010` movement model specifies behavior that current implementation does not provide:

- Guided Mode describes a fixed spline/waypoint journey; current camera performs straight-line `stepToward` movement.
- Mobile Free Exploration specifies tap-to-walk plus drag-to-look; `PlayerCamera` always faces fixed `-Z` and no drag-to-look exists.
- Keyboard equivalent says Escape opens semantic navigation; no equivalent implementation was found.
- Guided behavior says visitor can skip a stop; current controls expose Continue and Switch to Free, but not a defined skip-stop behavior.

Required fix: implement the accepted behavior and test it, or refine the movement section to what the product actually needs and obtain Juan's acceptance before treating it as satisfied. Do not retroactively reinterpret unchecked behavior as implemented.

## P0-03 — WebGL context-loss fallback criterion is not implemented/tested

The accepted criterion covers `WebGL-unavailable or WebGL-context-lost` fallback. Current coverage simulates WebGL unavailable at entry and a lazy-chunk JavaScript failure. `CanvasErrorBoundary` is a React error boundary; no `webglcontextlost` handling/evidence was found.

Required fix:

- add real context-loss detection/recovery-to-semantic behavior;
- create a regression/E2E test that dispatches or induces the relevant canvas context-loss path;
- verify content remains available and no reload loop traps the visitor.

## P0-04 — Direct-link/deep-link Acceptance Criterion is not met

US-010 says a direct link can open Software Lab semantic content without replaying arrival. Current evidence marks this complete because `SoftwareLabSection` is always present on the single page; there is no actual deep-link/routing contract demonstrated.

Required fix: implement a stable direct-link target (route or hash/fragment with deterministic focus/scroll behavior) and E2E it, or refine/re-accept the AC.

## P0-05 — M5 is declared complete while required M5 product scope is missing

`MASTER_BACKLOG.md` M5 includes:

- Architecture Table;
- Engineering Decisions v1;
- Technology Wall v1;
- Current Workbench v1;
- recruiter target: understand Juan's primary engineering identity/core stack quickly.

PR #4 explicitly says Engineering Decisions Wall / Technology Wall / Current Workbench are out of scope pending verified content. That does not match the backlog. In particular, Engineering Decisions v1 explicitly allows a generic engineering scenario and therefore is not blocked by Second Brain data.

Required fix:

- implement at least one inspectable Engineering Decision as specified;
- resolve Technology Wall / Current Workbench according to verified public data availability, with neutral absence only where the accepted scope allows it;
- do not mark M5 complete until its actual scope is closed or formally re-scoped.

## P0-06 — M7 is declared complete while its visual-fidelity scope is only partially present

M7's durable environment priorities include mountain/nature sightlines, selected fruit-bearing plants, transparent roof/skylight intent, and premium Software Engineering Lab lighting/interior treatment in addition to glass/water/vegetation/day-night.

Current `WorldScene` remains a procedural alpha with simple exterior/lab planes and does not implement all listed M7 requirements. This can be a valid intermediate visual iteration, but it cannot simultaneously be recorded as complete against the existing backlog.

Required fix: either finish the accepted M7 Alpha visual requirements, with externally accessible visual evidence, or explicitly refine milestone scope/status before claiming completion.

## P0-07 — Zavit purposeful-activity criterion is internally contradicted

The accepted journey says Zavit is doing something purposeful when the visitor arrives. `Zavit.tsx` currently performs a small idle head turn. The M4 handoff itself states that the pose is static and not visibly doing something purposeful, yet US-010 marks the criterion complete and project memory marks M4 complete.

Required fix: implement a visible purposeful idle activity appropriate to the graybox/alpha (for example interacting with a console/repair task) with reduced-motion behavior and visual/E2E evidence, or refine/re-accept the criterion.

## P0-08 — External visual audit cannot be independently performed from the PR

The PR says 33 screenshots were reviewed internally, but `/evidence` is gitignored, PR comments contain no screenshots, and no preview deployment/artifact accessible to the External Auditor is supplied.

For a UI/3D audit, code plus prose claiming screenshots existed is not enough.

Required fix: provide durable audit evidence through one or more of:

- CI artifact with screenshots/videos;
- representative compressed evidence committed under an audit-evidence path;
- PR attachments;
- accessible preview deployment.

Evidence must include desktop, mobile/adapted, reduced motion, semantic/no-WebGL, Atrium, Zavit, Software Lab, simulation normal/failure, day/night where claimed.

## P0-09 — Audit-ready validation is local-only; no independent CI/status exists

The PR head has no commit-status/Actions evidence. Given the project's own history of passing tests that failed to catch real defects, audit readiness should not rely only on session-reported local commands.

Required fix for this deliver:

- add a reproducible CI workflow or equivalent durable automated validation covering at least build, lint, typecheck, UT, smoke/E2E, and security/static checks;
- publish test results and visual evidence artifacts where feasible;
- keep performance evidence separate when hosted CI hardware cannot represent the accepted performance profile rather than fabricating a PASS.

## P0-10 — project-lead now references non-existent operational subagents

PR #4 changes project-lead policy to delegate to `@coder`, `@reviewer`, `@test-runner`, and `@architect`. At the audited head, `.opencode/agent/` contains only `project-lead`, `code-reviewer`, `visual-reviewer`, and `performance-reviewer`.

This makes the declared orchestration pipeline inconsistent/non-operational.

Required fix:

- register and validate the referenced operational agents in supported runtimes, with least privilege and actual Task smoke evidence; **or**
- simplify the project-lead rules to use only agents that really exist.

Also reconcile the mandated `.agents/session/cost-log.md` behavior with the actual implementation; do not require files/processes the runtime never produces.

---

# P1 — Required next iteration / close during P0 work if touched

## P1-01 — Public portfolio projection is still empty

`portfolio.public.json` contains `profile: null` and no capabilities. This is secure and preferable to fabricated content, but it means the current Alpha is an interactive HomeLab demo rather than a recruiter-useful portfolio.

Next product deliver should unblock M6 using verified/publishable Second Brain content and then feed at minimum:

- public profile/positioning;
- technology capability classifications;
- at least one approved Project/Experience record;
- Current Workbench / exploration where publishable;
- safe evidence references.

The browser must still never query the private Second Brain directly.

## P1-02 — Security network assertion is too narrow

The current E2E flags URLs matching `supabase`. Strengthen the public/private boundary test using explicit forbidden host/project identifiers and a browser-request allowlist/denylist derived from the accepted architecture, so a renamed proxy/private endpoint cannot bypass a string-only test.

## P1-03 — Current UI architecture is a strong Alpha but not yet the "very impressive" visual bar

The implementation correctly prioritized graybox, correctness, accessibility and performance. The next visual deliver should now improve composition/materials/environment/Software Lab staging without losing budgets. This is product-quality work, not a reason to add uncontrolled particles/bloom.

---

# P2

- Replace the duplicate/weak Zavit idle evidence capture with one that clearly demonstrates the character and purposeful activity.
- Consider OG/social metadata and a proper recruiter/contact affordance once public profile content is approved.

---

# What is good and should be preserved

- semantic content exists outside WebGL;
- 3D lazy-load/fallback architecture is sensible;
- deterministic simulation is clearly labeled `SIMULATION`;
- modal focus handling and mutual-exclusion fixes are good regression targets;
- public professional claims are not fabricated;
- private Second Brain is not directly wired to the browser;
- bundle sizes are comfortably below initial delivery budgets;
- internal reviewers found real defects and the project documented them rather than hiding them;
- one continuous world / one entrance portal / nature-water-glass direction remains intact.

---

# Required re-audit handoff

Before asking for re-audit, project-lead must provide an unmerged PR head with:

- P0 checklist mapped to exact fixes/tests;
- full UT/integration/smoke/E2E/regression/security/accessibility suite status;
- CI or durable automated validation evidence;
- external-auditor-accessible UI evidence/preview;
- required performance measurements with methodology and honest PASS/FAIL;
- story/milestone status reconciled with actual completion;
- M6/public-content status clearly separated from private Second Brain;
- updated handoff and project memory.

Final status requested from project-lead:

`READY FOR EXTERNAL RE-AUDIT — UI ALPHA`
