# Delivery Workflow

Status: `ACCEPTED` by Juan on 2026-08-31 (`US-003`).

## Normal flow

`ACCEPTED SPEC → WORKING BRANCH → IMPLEMENTATION → INDEPENDENT INTERNAL REVIEW → VALIDATION → HANDOFF → PR → EXTERNAL AUDIT → FIXES → AUDITED → MERGE → DONE`

1. Juan accepts explicit scope/criteria.
2. `project-lead` branches from current `main`: `<type>/US-XXX-short-name`; a coherent batch may reference multiple accepted stories.
3. Commits reference story IDs when practical.
4. Runtime-native specialist agents review independently. Author self-review never satisfies gate.
5. Applicable validation records PASS/FAIL/N/A/NOT MEASURED accurately.
6. Handoff is committed under `docs/handoffs/`.
7. PR body references stories, changes, validation, findings, gaps, deviations, decisions, and audit status.
8. External Auditor (ChatGPT) inspects GitHub and reports BLOCKER/P0/P1/P2/P3.
9. Findings become fixes or durable `BUG-XXX`/`US-XXX` specs where useful.
10. BLOCKER and milestone P0 findings must be resolved and re-audited before story becomes `AUDITED`.
11. Only audited work is merge-eligible. After merge, story becomes `DONE`.

Direct feature/foundation pushes to `main` and pre-audit merges are prohibited.

## Exceptions

- Trivial: typo/formatting/internal maintenance with no behavior, architecture, contract, security, or public-claim effect may use a lightweight branch/PR without story ceremony.
- Emergency: urgent security/recovery work may merge before normal audit only with Juan's explicit approval. Record reason, validation, commit, and mandatory post-merge audit in `docs/audits/`.

Exceptions never authorize silent scope changes or untraceable direct work.
