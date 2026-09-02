# ADR-005 — Public Content Delivery for Alpha

Status: `ACCEPTED` (project-lead technical authority, within the already-accepted security boundary in `docs/architecture/PORTFOLIO_KNOWLEDGE_ARCHITECTURE.md`; the public claim *content* itself still requires Juan's separate review before publication — presented for visibility at the `US-010` acceptance gate)
Traceability: `US-010`, `docs/architecture/PORTFOLIO_KNOWLEDGE_ARCHITECTURE.md`, `docs/architecture/CONTENT_MODEL.md`
Date: 2026-09-02

## Context

`docs/architecture/PORTFOLIO_KNOWLEDGE_ARCHITECTURE.md` defines three compliant delivery options (build-time static artifact, stored public read model, narrow read-only API) and requires selecting "the simplest compliant option per accepted story." `M6 — Public Portfolio Projection v1` is the full live-sourced projection from the Second Brain, but the Alpha (`M2`–`M9`) needs professional content for the Software Engineering Lab (`M5`) before that publication pipeline exists.

## Decision

Alpha ships a **build-time sanitized static JSON artifact** (option 1) — hand-authored and reviewed by Juan, not yet sourced live from Supabase — consumed through the same typed knowledge-client interface that the real `M6` Portfolio Knowledge API will later implement. Exact file path and schema are finalized at `M2` implementation time.

Requirements on the artifact:

- Every claim already satisfies `docs/architecture/CONTENT_MODEL.md`'s `VERIFIED`/`UNVERIFIED`/`UNKNOWN` classification.
- No unverified metrics, companies, or business impact ships (AGENTS.md §17).
- Any content not yet backed by verified evidence is rendered with a visible `PLACEHOLDER — REQUIRES EVIDENCE` label, never presented as fact.
- No Supabase credentials, endpoints, or query surface exist in the browser or build output — the strongest possible instantiation of the trust boundary, since there is no live connection at all in Alpha.

The client interface is designed so that swapping the static artifact for a real Portfolio Knowledge API at `M6` requires no change to 3D/semantic presentation components — only the client implementation behind the same interface changes.

## Alternatives Considered

- **Build the real Portfolio Knowledge API now.** Rejected — `M1`/Alpha scope explicitly excludes backend/cloud without measured need; premature while no live publication workflow exists.
- **Ship placeholder/fictional text instead of reviewed real content.** Rejected — violates AGENTS.md §17 even for placeholder copy; unverified or fabricated-reading content is not acceptable regardless of visual labeling intent.

## Consequences

- A manual content-authoring/review step (Juan approves the static artifact's claims) is required before `M5`/`M6` content ships publicly. This is a small future decision point, not a blocker for `M1`.
- The knowledge-client interface contract must be designed carefully at `M2`, since `M6` depends on its shape not changing.
- Satisfies `docs/architecture/TECHNICAL_ARCHITECTURE.md`'s "public content delivery method for the first slice" item under "Required Decisions Before US-010 Implementation."
