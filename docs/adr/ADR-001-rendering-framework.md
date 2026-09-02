# ADR-001 — Rendering Framework: React Three Fiber over Vanilla Three.js

Status: `ACCEPTED` (project-lead technical authority; presented for visibility at the `US-010` acceptance gate)
Traceability: `US-010`, `docs/architecture/TECHNICAL_ARCHITECTURE.md`
Date: 2026-09-02

## Context

`docs/architecture/TECHNICAL_ARCHITECTURE.md` lists React + TypeScript + Three.js + React Three Fiber (R3F) as a **candidate**, not locked, and requires an accepted ADR plus an executable spike comparing R3F against direct Three.js ownership across bundle/runtime cost, accessibility integration, asset loading/disposal, testability/ergonomics, degraded/mobile experience, and maintenance risk before implementation begins.

## Spike

Two minimal, functionally identical Vite production builds were built and measured (rotating lit cube, one camera, two lights, resize handling):

| Stack | Packages | Raw JS | Gzip JS |
| --- | --- | ---: | ---: |
| Vanilla Three.js | `three` | 517.77 KB | 129.37 KB |
| React + React Three Fiber | `react`, `react-dom`, `three`, `@react-three/fiber` | 1,072.33 KB (+1.78 KB CSS) | 294.08 KB |

Both scenes import `three` via `import * as THREE`, which is not tree-shaken; real implementation should use named imports to lower both baselines. The comparison is a coarse two-project measurement, not a per-package breakdown — a bundle analyzer should be run again once the real graybox scene exists (tracked under `M3`/`M8`).

R3F costs roughly **165 KB gzip more** than vanilla Three.js for an equivalent empty scene, driven by the React + ReactDOM runtime, not by the Fiber reconciler itself. Both stay under `docs/architecture/PERFORMANCE_BUDGET.md`'s 500 KB gzip "3D runtime chunk" target, but R3F leaves materially less headroom (~200 KB gzip) for the actual graybox scene, interaction code, and any `drei` helpers adopted later.

## Decision

Adopt **React + TypeScript + React Three Fiber** for the 3D runtime chunk, lazy-loaded behind capability/opt-in checks so the semantic shell budget (<=170 KB JS) is unaffected.

Rationale, weighed against the measured cost:

- **Semantic UI integration.** R3F composes 3D content inside the same React component tree as HUD panels, the Architecture Table, and accessible equivalents (`docs/architecture/TECHNICAL_ARCHITECTURE.md` Experience Layers). Vanilla Three.js would need a second, hand-synchronized state layer for every overlay.
- **Accessibility overlays.** Because scene state lives in React state/hooks, deriving the required semantic/keyboard equivalents (AGENTS.md §21) is direct instead of a manually mirrored state machine.
- **Asset lifecycle/disposal.** `<Suspense>` + `useLoader` + unmount-triggered disposal reduce manual leak risk versus hand-written Three.js dispose paths — directly relevant to `PERFORMANCE_BUDGET.md`'s "no sustained growth across 5 enter/exit cycles" guardrail.
- **Testability.** React Testing Library patterns apply to R3F scene-graph components; vanilla Three.js needs bespoke imperative-scene test harnesses.
- **Multi-agent maintenance.** Declarative, typed React components are lower-risk for AI agents editing the codebase incrementally than an imperative Three.js scene graph.
- **Ecosystem on demand.** `drei`/`postprocessing` helpers (LOD, instancing, environment) are available if a measured need arises, without hand-rolling equivalents.

Costs accepted: ~165 KB extra gzip baseline, one more moving part (the reconciler) in the performance story, and React/R3F version-compatibility churn to track over time.

## Alternatives Considered

1. **Vanilla Three.js.** Cheaper baseline bytes, rejected because it forces a second manual state/sync layer for semantic overlays and accessibility equivalents, and manual resource-lifecycle bookkeeping — raising long-term regression risk for a shell-first, accessibility-heavy, agent-maintained codebase.
2. **Babylon.js.** Not spiked; rejected on scope grounds — a second engine ecosystem alongside the React shell with no measured HomeLab-specific advantage. Revisit only if a specific capability (e.g. built-in physics/GUI) is accepted and justified.
3. **PlayCanvas / editor-first engines.** Rejected — editor-centric workflow does not fit the code-first, spec-driven, agent-editable repository model.

## Consequences

- The 3D runtime chunk has materially less headroom than its raw budget number suggests; `ADR-003` (asset pipeline) and per-zone code splitting (`docs/architecture/TECHNICAL_ARCHITECTURE.md` Capability and Loading Boundaries) become required, not optional, for `M3` onward.
- A bundle analyzer pass is required once the real graybox scene exists, to re-validate this comparison against actual (not synthetic) code.
- `docs/architecture/PERFORMANCE_BUDGET.md`'s "Required Decisions Before US-010 Implementation" rendering-framework item is satisfied by this ADR.
