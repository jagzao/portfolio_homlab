# Portfolio Knowledge Architecture

Status: FOUNDATION / DESIGN ONLY
Traceability: US-004
Last updated: 2026-08-31

## Purpose

Define the non-negotiable security boundary between Juan's private Second Brain and public HomeLab content.

## Sources of Truth

- Private professional knowledge: Juan's Supabase Second Brain, project `oweqrcmxmmxzyahyleap`.
- Public implementation and accepted specifications: `jagzao/portfolio_homlab`.
- HomeLab frontend: a consumer, never the authority for professional claims.

## Trust Boundary

```text
PRIVATE TRUST ZONE
Supabase Second Brain (oweqrcmxmmxzyahyleap)
  -> verification
  -> sanitization and explicit publication decision

PUBLIC TRUST ZONE
Public Portfolio Projection
  -> Portfolio Knowledge API or static public artifact
  -> HomeLab semantic experience and 3D adapters
  -> Zavit
  -> Visitor
```

Zavi is Juan's AI/Second Brain ecosystem. Zavit is the HomeLab robot host. Zavit may read only the public projection.

## Non-Negotiable Controls

- Never ship private Supabase credentials, service-role keys, tables, endpoints, or unrestricted queries to the browser.
- Never connect a browser or Zavit directly to the private Second Brain.
- Never expose unrestricted RAG, embeddings search, or free-form retrieval over private knowledge.
- Publication must be explicit, field-scoped, sanitized, reversible, and auditable.
- Default deny: missing publication approval means the record is absent from public output.
- Public output must contain only fields required by the accepted portfolio capability.
- Logs, analytics, errors, and caches must not leak rejected/private source content.

## Publication Pipeline

1. Select a candidate record inside the private boundary.
2. Establish provenance and classify every claim as `VERIFIED`, `UNVERIFIED`, or `UNKNOWN`.
3. Remove secrets, personal data, employer-confidential data, unsupported metrics, and internal identifiers.
4. Juan or an explicitly authorized publication workflow approves the public representation.
5. Materialize a minimal public projection carrying provenance-safe metadata.
6. Validate the public artifact against its contract and forbidden-field rules.
7. Publish atomically; retain an audit reference without copying private source text.
8. Support withdrawal and cache invalidation.

Only `VERIFIED` claims that are explicitly publishable may appear as factual professional claims. `UNVERIFIED` and `UNKNOWN` remain internal knowledge gaps; they must not be silently converted to public facts.

## Public Contract Requirements

Each public record must include:

- stable public identifier unrelated to private database keys;
- content type and display fields;
- verification state (`VERIFIED` for factual publication);
- publication state and public revision timestamp;
- safe evidence/citation metadata when approved;
- optional technology proficiency category grounded in evidence.

The precise model is defined in `docs/architecture/CONTENT_MODEL.md`.

## Delivery Options

The simplest compliant option should be selected per accepted story:

1. build-time sanitized static artifact;
2. independently stored public read model;
3. narrow read-only Portfolio Knowledge API.

An API is not mandatory. A decision must consider freshness, withdrawal latency, operational cost, caching, abuse controls, and auditability. Direct private-database access is never an option.

## Threats and Required Responses

| Threat | Required response |
| --- | --- |
| Prompt/query extraction | No unrestricted private retrieval; allowlisted public queries only |
| Accidental claim fabrication | Verification state plus evidence and publication gate |
| Credential exposure | No private credentials/client configuration in public artifacts |
| Over-broad projection | Allowlisted fields, contract tests, forbidden-field scan |
| Stale/revoked content | Revisioning, withdrawal process, cache invalidation |
| Enumeration/scraping | Minimal records; rate limiting if an API is justified |
| Error/log leakage | Redaction and public-data-only observability |

## Validation Required Before Any Integration

- threat-model review;
- public schema and forbidden-field contract tests;
- secret scan of build output and repository;
- test proving browser traffic never reaches private Supabase resources;
- publication/withdrawal audit test;
- Juan approval for public professional claims.

## Out of Scope

No Supabase migrations, policies, functions, credentials, ingestion pipeline, public API, or frontend integration are created in Foundation.
