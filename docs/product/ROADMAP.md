# HomeLab Roadmap

Status: ACTIVE planning document
Owner: Juan
Traceability: US-004

## Sequencing rule

Each milestone proceeds through accepted spec, branch, implementation, internal review, validation, handoff, PR, External Audit, fixes, and merge eligibility. A roadmap item is not authorization to implement it.

## Milestones

### Foundation — current

Establish canonical SDD, operational specialist review, auditable Git/PR workflow, and durable product/architecture direction through US-001–US-004. Exit only after External Audit findings are resolved and the work is eligible to merge.

### Vertical Slice 01 — next candidate

`US-010` is a placeholder ID and must be refined to ACCEPTED before implementation. Candidate scope:

- forest approach;
- HomeLab exterior;
- main energy portal;
- Central Atrium;
- Zavit placeholder;
- holographic table;
- bridge;
- Software Engineering Lab;
- one interactive architecture.

Refinement must reduce this scope if it cannot form a measurable, performant vertical slice. It must decide rendering approach, semantic fallback, claim data source, target devices, asset strategy, and visual/performance evidence. No US-010 implementation belongs to Foundation.

### Portfolio Knowledge capability — future

Design and implement the verified public projection and Portfolio Knowledge API only after security, content lifecycle, ownership, and cost decisions are accepted. No private Supabase access from browsers. Project `oweqrcmxmmxzyahyleap` is a private boundary identifier, not permission to connect or migrate.

### World expansion — future

AI, Robotics, Smart Home, Library, Observatory, Innovation Vault, gardens, second floor, and further world systems are unrefined. Add areas one vertical slice at a time, based on verified content and product value.

## Decision gates before US-010 acceptance

Owner for gates: `project-lead`; product acceptance: Juan. Gates are sequence-based, not calendar promises.

- Choose rendering stack through analysis/ADR; React, TypeScript, Three.js, and React Three Fiber remain candidates.
- Define the smallest coherent walkable route and loading boundaries.
- Define desktop, mobile/adapted, low-power, reduced-motion, and semantic modes.
- Define public placeholder policy and prohibit fabricated professional evidence.
- Establish measurable visual, accessibility, performance, and browser support criteria.
- Confirm how independent reviewers will collect real render and runtime evidence.

## Explicit non-goals for Foundation

No Three.js scenes, environments, Zavit model, Software Lab implementation, shaders, 3D assets, portfolio backend, database migration, or cloud infrastructure.
