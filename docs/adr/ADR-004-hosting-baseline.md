# ADR-004 — Hosting and Deployment Baseline (Alpha)

Status: `ACCEPTED` (project-lead technical authority; zero-cost decision, no Juan cost approval required per AGENTS.md §28; presented for visibility at the `US-010` acceptance gate)
Traceability: `US-010`
Date: 2026-09-02

## Context

`M1` requires the cheapest defensible hosting baseline. AGENTS.md §28 and the `project-lead` skill's cost-discipline rules prohibit provisioning paid/decorative cloud infrastructure and require preferring static hosting, free tiers, and scale-to-zero.

## Candidates Compared

| Option | Static hosting | Scale-to-zero functions | Cost at alpha traffic | Notes |
| --- | --- | --- | --- | --- |
| GitHub Pages | Yes | No | $0 | Simplest, but no edge/serverless path if `M6` needs one |
| **Cloudflare Pages** | Yes | Yes (Pages Functions) | $0 | CDN, preview deploys per PR, edge functions available without a new provider |
| Vercel / Netlify | Yes | Yes | $0 (comparable tier) | Similar model; more analytics/commercial upsell surface than needed |
| Azure Static Web Apps | Yes | Yes | $0 tier exists | Pulls in an Azure billing surface for a purely static alpha with no measured Azure-specific need yet |

## Decision

Adopt **Cloudflare Pages** as the alpha hosting baseline: static hosting today, with Pages Functions available at $0 if `M6 — Public Portfolio Projection` later needs a narrow read-only edge endpoint instead of the `ADR-005` static artifact — avoiding a second provider migration when that need is measured.

Deployment is Git-integrated from `main` only, never from feature branches, so nothing merge-gated by SDD reaches production ahead of `AUDITED`/`DONE`.

## Alternatives Considered

- **Azure/AWS full application hosting.** Rejected for the alpha — unjustified cost/operational complexity for static content; Azure remains a legitimate future candidate only if a real Azure-backed capability (e.g. a .NET API demonstrating production experience) is accepted through its own spec, not to display a logo.
- **Self-hosted VPS.** Rejected — operational burden disproportionate to a static SPA, no scale-to-zero.
- **GitHub Pages.** Viable and free, but rejected in favor of Cloudflare Pages solely because it lacks a same-provider path to a future edge function, which would otherwise force a provider migration at `M6`.

## Cost

$0 at alpha traffic (Cloudflare Pages free tier: unlimited static requests/bandwidth; 100k Functions requests/day if ever used, which alpha traffic will not approach).

## Exit Path

Build output is a portable static Vite bundle. Moving to GitHub Pages, Netlify, Vercel, or Azure Static Web Apps later requires no application rewrite — only redeploy configuration. Low lock-in.

## Consequences

Satisfies `docs/architecture/TECHNICAL_ARCHITECTURE.md`'s "hosting and deployment baseline" item under "Required Decisions Before US-010 Implementation." No infrastructure is provisioned by this ADR alone — provisioning happens at `M2` implementation time, still gated by the normal delivery workflow.
