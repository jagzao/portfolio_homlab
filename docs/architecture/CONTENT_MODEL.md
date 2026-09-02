# Content Model

Status: FOUNDATION / PROVISIONAL CONTRACT
Traceability: US-004
Last updated: 2026-08-31

## Purpose

Define a presentation-neutral model for verified professional content. This is a design contract, not a database schema.

## Content Principles

- Content is authored/verified outside the frontend and projected into a public model.
- Semantic HTML and 3D scenes consume the same public records through separate adapters.
- No claim is inferred from a logo, technology association, or scene decoration.
- Missing evidence remains a knowledge gap.
- Stable public identifiers must not reveal private database identifiers.

## Knowledge States

| State | Meaning | Public factual display |
| --- | --- | --- |
| `VERIFIED` | Supported by reviewed evidence | Allowed only after explicit publication approval |
| `UNVERIFIED` | Plausible but evidence/review incomplete | Prohibited as fact |
| `UNKNOWN` | Information absent or unresolved | Prohibited; may create an internal knowledge gap |

Verification and publication are separate. `VERIFIED` does not automatically mean public.

## Publication States

- `PRIVATE`: never crosses the private boundary.
- `REVIEW_REQUIRED`: sanitized candidate awaiting approval.
- `PUBLISHED`: approved and present in the public projection.
- `WITHDRAWN`: removed from public delivery; caches must expire/invalidate.

Only `VERIFIED + PUBLISHED` factual claims may reach visitors.

## Public Entity Types

| Entity | Purpose | Minimum safe fields |
| --- | --- | --- |
| Profile | Public identity and positioning | public id, display name, verified headline, summary |
| Capability | Demonstrable skill/technology | public id, label, proficiency category, evidence references |
| Project | Approved project narrative | public id, title, summary, role, capability refs, evidence refs |
| Evidence | Safe support for a claim | public id, kind, public label/link or approved summary |
| Experience | Approved professional context | public id, organization label if publishable, role, date range, evidence refs |
| Exploration | Current learning/experiment | public id, topic, status, disclaimer, evidence refs |
| KnowledgeGap | Internal follow-up | never included in public projection |

Dates, employers, metrics, responsibilities, outcomes, traffic, SLA, users, architectures, and technology usage require their own evidence. Verification of one field does not verify the entire entity.

## Common Public Envelope

```text
id: opaque public identifier
type: entity type
revision: monotonic public revision
verification: VERIFIED
publication: PUBLISHED
publishedAt: timestamp
updatedAt: timestamp
display: allowlisted entity fields
evidence: zero or more safe public evidence references
```

Private source identifiers, reviewer notes, raw evidence, confidence reasoning, and rejected values are excluded.

## Technology Proficiency

Use evidence-backed display categories rather than numeric mastery scores:

- `CORE`: central, repeatedly demonstrated capability.
- `PRODUCTION_EXPERIENCE`: supported real-world use without implying core depth.
- `ACTIVE_EXPLORATION`: current learning or experimentation, explicitly not equivalent to production expertise.

Python is initially `ACTIVE_EXPLORATION` unless accepted evidence changes that classification. Other technologies receive no category until evidence exists.

## Simulation Content

Future Software Engineering Lab simulations use a separate `SIMULATION` content kind. All generated latency, queue depth, error, retry, circuit-breaker, and recovery values must be visibly labeled simulation and must never become professional evidence.

## Presentation Rules

- Semantic pages expose readable headings, descriptions, evidence, and links.
- 3D elements may summarize or spatialize records but cannot alter verification meaning.
- Zavit can explain only public records delivered to HomeLab.
- A missing record produces neutral absence, never generated filler.
- Temporary design placeholders must say `PLACEHOLDER` and contain no invented professional facts.

## Contract Validation

Before public delivery, validate:

- only supported entity and state values;
- factual public records are `VERIFIED + PUBLISHED`;
- no private identifiers or forbidden fields;
- evidence links resolve to approved public evidence;
- withdrawn records are absent;
- simulation and placeholder content are unmistakably labeled;
- semantic and 3D adapters preserve the same meaning.

## Open Decisions

Serialization format, schema tooling, localization, evidence URL policy, freshness SLA, and public delivery mechanism require accepted stories/ADRs before implementation.
