# Technical Architecture

Status: FOUNDATION / CANDIDATE
Traceability: US-004
Last updated: 2026-08-31

## Purpose

Define constraints and decision gates for HomeLab before application implementation. This document does not select a final runtime stack or authorize backend/cloud work.

## Architecture Principles

1. The 3D world is the primary experience, not the only way to access professional content.
2. Semantic content, navigation, and core portfolio evidence work without WebGL.
3. Load only the assets and capabilities required by the current visitor journey.
4. Introduce backend or cloud services only for accepted capabilities with measured need.
5. Keep professional claims outside scene code and behind a typed content boundary.
6. Prefer static hosting and scale-to-zero services; no decorative multi-cloud.

## Experience Layers

| Layer | Responsibility | Must work without WebGL |
| --- | --- | --- |
| Semantic portfolio | Verified projects, skills, evidence, contact and navigation | Yes |
| Application shell | Routing, accessibility, loading, errors and capability detection | Yes |
| 3D experience | Continuous world, interaction, spatial storytelling | No |
| Knowledge client | Reads public portfolio projection only | Yes |
| Optional services | Capabilities that cannot be delivered statically | Depends on accepted spec |

Professional information must remain discoverable through semantic HTML, keyboard navigation, SEO-compatible pages, reduced-motion behavior, and a mobile-adapted mode.

## Candidate Frontend Stack

The current candidate is React + TypeScript + Three.js + React Three Fiber. It is **not locked**.

Before implementation, an ADR must compare at least:

- React Three Fiber versus direct Three.js ownership;
- bundle and runtime cost;
- accessibility integration;
- asset loading and disposal behavior;
- testability and developer ergonomics;
- degraded/mobile experience;
- maintenance risk.

Selection requires an accepted ADR and an executable spike tied to a story. Framework preference alone is insufficient.

## Capability and Loading Boundaries

- Ship semantic shell and critical route content first.
- Load the 3D runtime only after capability checks and visitor intent permit it.
- Split future areas by route/experience boundary; do not preload every pavilion.
- Stream models and textures per vertical slice.
- Detect reduced motion, constrained devices, data-saving preference, and WebGL failure.
- Provide explicit loading, degraded, offline/error, and recovery states.

Detailed numerical constraints live in `docs/architecture/PERFORMANCE_BUDGET.md`.

## Data Flow

```text
Public Portfolio Projection
  -> Portfolio Knowledge API or static public artifact
  -> typed knowledge client
  -> semantic portfolio + 3D presentation adapters
  -> visitor
```

Scene components are presentation adapters. They must not become the canonical store for companies, projects, skills, metrics, or experience.

## Backend and Cloud Decision Gate

No backend is required for Foundation. A future service requires:

1. an accepted User Story describing the capability;
2. proof that static/client-only delivery is insufficient;
3. security, cost, availability, privacy, and operational analysis;
4. an ADR for an expensive-to-reverse choice;
5. an owner, observable failure behavior, and scale-to-zero/default cost estimate.

ASP.NET Core, PostgreSQL, Python, Azure, AWS, and OpenTelemetry are candidates only. Their presence in Juan's technology story does not justify deploying them.

## Quality Boundaries

- Application shell owns errors; a failed 3D experience cannot erase semantic content.
- 3D resources need deterministic loading, cancellation, reuse, and disposal.
- Visitor flows require keyboard-accessible equivalents for spatial interactions.
- Simulated architecture data must be labeled `SIMULATION` and cannot be presented as production evidence.
- Public data contracts carry verification and publication metadata defined in `docs/architecture/CONTENT_MODEL.md`.

## Required Decisions Before US-010 Implementation

- rendering framework ADR;
- hosting and deployment baseline;
- mobile/degraded-mode threshold;
- asset pipeline and compression strategy;
- public content delivery method for the first slice;
- measurable performance test matrix.

## Out of Scope

Scenes, shaders, models, migrations, APIs, cloud infrastructure, authentication, and production observability are not implemented in this iteration.
