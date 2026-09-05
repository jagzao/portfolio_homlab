# External Re-Audit — PR #4 UI Alpha

Status: `CHANGES REQUIRED`
External Auditor: ChatGPT
Audit date: 2026-09-05
Implementation head audited: `ec3edfbcb787fddb1e205f5eb8fd49c062e8d27d`
PR: `#4 — HomeLab UI Alpha — US-010 Vertical Slice 01 (M2-M8)`

This re-audit independently inspected the delta from the prior audited head, current source/spec/handoff, the GitHub Actions run for `ec3edfb`, its job logs/artifacts, and the generated visual-evidence artifact.

## Executive result

The agent closed a large portion of the previous audit correctly: real WebGL context-loss fallback, hash deep-linking, movement/input additions, M5 stations, Zavit activity code, CI infrastructure, stronger network-boundary tests, durable evidence artifacts, and orchestration-rule cleanup are all meaningful progress.

However PR #4 is **not audit-ready or merge-ready** yet. The new CI at the exact audited head is red, the accepted performance contract is still incomplete/open, and the durable story state/claims do not fully match the evidence. The visual artifact is now externally inspectable, but it also confirms that M7 remains closer to a polished graybox than the memorable HomeLab visual language described by the backlog.

Do not merge.

---

# BLOCKER / P0 — Required before next re-audit

## P0-RA1 — CI is failing at the exact audited head

GitHub Actions run `33941203609` for head `ec3edfb` completed with conclusion `failure`.

The validation job passed typecheck/lint/unit/build/security, but the E2E job failed:

- `115 passed`, `7 failed` in the functional run;
- failed desktop critical Guided path;
- failed desktop keyboard-only critical path;
- failed desktop critical-path network-boundary flow;
- failed desktop Escape/Zavit modal regression;
- failed desktop strengthened network-boundary flow;
- failed desktop reduced-motion Zavit greeting regression;
- failed mobile sustained-route heap/navigation run.

Therefore the handoff/comment claim `E2E: 162 passed` is not valid as audit evidence for the current head, and `P0-09` from the previous audit is not closed merely because a workflow file exists.

Required fix:

1. make the required CI run green on the exact PR head;
2. update handoff/PR summary from actual CI results, not only a local run;
3. retain failure artifacts for every red run;
4. re-run CI after fixes and provide the successful run id/head SHA.

## P0-RA2 — Core functional E2E, performance sampling, and evidence capture are mixed in a way that creates contention and flakiness

The main E2E command still executes performance-heavy specs such as `perf-heap-route.spec.ts`, `perf-sample.spec.ts`, `perf-gpu.spec.ts`, `m8-perf-sample.spec.ts`, and also `m3-evidence.spec.ts`, while two WebGL workers run in parallel.

The same CI run shows severe contention signals while core flows are running:

- desktop representative sample: ~`6.7 FPS`, p95 ~`191 ms`;
- mobile sample: ~`17.8 FPS`, p95 ~`76.7 ms`;
- desktop long-task sample: `15` tasks >50ms and one ~`816ms`;
- mobile long-task sample: one ~`541ms`;
- core simulation tests timed out before the deterministic 10-second sequence reached recovery.

These CI numbers are not accepted device benchmarks, but they prove the CI topology is contaminating functional reliability.

Required fix:

- split **core functional CI** (UT/integration/smoke/E2E/security/accessibility) from **visual evidence** and **performance measurement** jobs;
- keep core E2E deterministic and green under normal hosted-runner variance;
- run heavyweight perf tests serially / isolated and label hosted-runner data informational unless it matches the accepted reference profile;
- do not let perf/evidence jobs starve the critical-path suite.

## P0-RA3 — P0-01 performance contract is still not resolved

The new handoff correctly admits the desktop p95 gate is open, but other mandatory accepted methods are also still unresolved:

- `PERFORMANCE_BUDGET.md` requires LCP on **mobile 4G at p75**; the handoff still says the measurement is not mobile-4G/p75.
- INP remains a proxy, not the accepted measurement.
- Long-task budget is `none >200ms`; the handoff itself reports `208–237ms` locally, while CI produced much larger long tasks.
- Desktop p95 remains `18.8–21.0ms` against `<=20ms`, so it is not a clean pass.
- `perf-heap-route.spec.ts` explicitly states it is **NOT a literal 5-minute wall-clock route**, while the accepted budget says `JS heap after 5-minute route`.
- exact reference hardware required by the accepted budget is still not durably recorded with the benchmark.

The representative multi-pass heap sample is useful, but it cannot be labeled as satisfying the literal accepted 5-minute route gate unless the spec is formally refined and re-accepted.

Required fix: either execute the accepted methodology on a documented reference device/network, or refine the performance contract and obtain Juan's explicit acceptance before treating different methodology as equivalent.

Do **not** relax the 20ms desktop target yet solely to make the current Alpha pass: the scene is still relatively simple, so maintaining headroom matters before higher-fidelity assets arrive.

## P0-RA4 — Story lifecycle reconciliation is invalid under the current SDD contract

`US-010` currently records `ACCEPTED → IMPLEMENTED → READY`. The canonical lifecycle in `.agents/AGENTS.md` is:

`DRAFT → READY → ACCEPTED → IMPLEMENTED → AUDITED → DONE`.

`READY` means refinement is complete and awaiting acceptance; Juan already accepted this story. Moving backward to `READY` loses the distinction between accepted scope and validation still in progress.

Required fix:

- keep the story at `ACCEPTED` while implementation/validation gates are incomplete, **or**
- propose a new explicit state such as `VALIDATION_BLOCKED` / `IMPLEMENTATION_COMPLETE_VALIDATION_OPEN` and obtain Juan's acceptance of the lifecycle change before using it.

Do not invent backward lifecycle semantics ad hoc.

## P0-RA5 — A real navigation/layering defect appears in CI on mobile

The mobile sustained-route test timed out because content from the Software Lab overlay intercepted pointer events intended for the landmark HUD (`SoftwareLabSection` subtree intercepting the `Forest Approach` button click).

This is more than a performance-test nuisance: the Lab overlay is non-modal but can cover/steal interaction from navigation behind it.

Required fix:

- make overlay and navigation layering intentional;
- either provide explicit close/minimize behavior, reserve non-overlapping layout, or gate pointer-events appropriately;
- add a regression E2E proving a visitor can leave the Software Lab and select another landmark on desktop and mobile after opening/seeing Lab content.

---

# P1 — Important before M6 / next product iteration

## P1-RA1 — M7 visual fidelity is still a polished graybox, not yet the accepted memorable HomeLab language

External audit can now inspect the evidence artifact. The additions are present literally (fruit accents, roof planes, mountain cones, lab glow), but the screenshots still read as primitive graybox geometry:

- exterior is largely a flat glass wall/portal silhouette;
- mountains/vegetation are simple cones/spheres;
- bridge/water are basic planes/boxes;
- Software Lab is mostly a facade plus a large HTML overlay that obscures the 3D composition;
- after entering 3D, a large semantic header and journey content still consume substantial viewport space, reducing immersion;
- material/lighting/environment depth is far below the original "memorable / very impressive" HomeLab direction.

Recommendation: do not call this final visual fidelity. Either mark M7 as `IN PROGRESS / ALPHA-1` or create the next visual-hardening deliver after the technical gates are green.

The next visual iteration should prioritize composition and immersion before adding more rooms: full-screen/immersive 3D presentation after entry, stronger pavilion depth/interior staging, convincing water/bridge/glass/lighting, better environment silhouettes, and a Software Lab UI that feels physically integrated rather than a large translucent webpage over the scene.

## P1-RA2 — Zavit purposeful activity exists in code, but the external visual evidence is weak

The code now contains a repair console and animated working state, and E2E asserts it. However `desktop-chromium-zavit-01-idle.png` still frames Zavit from far away and does not clearly demonstrate the purposeful activity.

Add a close visual capture or short video/GIF artifact showing Zavit working before greeting, plus the greeting transition. This is especially useful because "purposeful" is a visual/product claim, not only a scene-graph claim.

## P1-RA3 — Technology Wall is not yet ready to consume real M6 capabilities

`TechnologyWall.tsx` detects whether capabilities exist, but when they do exist it renders only generic category descriptions; it does not render the actual capability labels/records grouped by category.

Before M6 publishes real content, extend the component/contract so verified public capabilities actually appear, with evidence/provenance behavior as designed.

`CurrentWorkbench` likewise has only a neutral state and no public-data contract yet; design that contract as part of M6 rather than hardcoding experiments.

## P1-RA4 — PR body and audit handoff need to be synchronized with current reality

The PR body still describes the older state (41 unit tests / 116 E2E, evidence gitignored, earlier performance numbers). The re-audit comment/handoff describe a newer state, and CI shows another state again.

Before the next re-audit, update the PR body/handoff from the exact final head and successful CI run so the PR has one authoritative audit summary.

---

# P2

- `Upload Playwright report` currently uploads nothing because Playwright is configured with the `list` reporter. Either configure an HTML/blob/JUnit report in CI or remove the dead artifact step.
- Keep the CI visual-evidence artifact; it is useful and successfully produced even on the failed run. Do not treat successful screenshot capture as evidence that functional E2E passed.

---

# Verified progress from the previous audit

The following previous findings are substantially implemented and should be preserved:

- real `webglcontextlost` handling and semantic fallback;
- stable `#software-lab` deep-link/focus behavior;
- spline/skip/Escape/drag-to-look implementation exists with targeted tests;
- Engineering Decisions v1 exists and is honestly generic;
- Technology Wall / Current Workbench use neutral absence rather than fabricated claims;
- Zavit repair-console activity exists in code and tests;
- stronger network allowlist/denylist helper exists;
- CI infrastructure and audit evidence artifacts now exist;
- project-lead no longer references the previous nonexistent named agents;
- external audit can now inspect real generated screenshots.

---

# Required next handoff

Before requesting another re-audit, provide an unmerged PR head with:

1. successful CI run on the exact head SHA;
2. zero failing required functional tests;
3. core E2E separated from perf/evidence contention;
4. navigation-overlay regression fixed;
5. accepted performance methodology completed, or a Juan-accepted spec refinement;
6. story lifecycle state consistent with `.agents/AGENTS.md`;
7. handoff/PR body synchronized to the successful CI run;
8. current known gates listed honestly.

Final requested status:

`READY FOR EXTERNAL RE-AUDIT — UI ALPHA / CI GREEN`
