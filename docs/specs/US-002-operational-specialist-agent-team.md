# US-002 — Operational Specialist Agent Team

Status: `IMPLEMENTED`
Accepted by: Juan
Accepted on: 2026-08-31
Last transition: `ACCEPTED → IMPLEMENTED` on 2026-09-01

## User Story

As project-lead, I want invocable independent specialist reviewers, so implementation quality is not self-approved.

## Refinement Gate

- Problem: central reviewer prompts exist but are not runtime agents.
- User: project-lead and External Auditor.
- Value: independent, evidence-backed quality gates.
- Behavior: delegate code, visual, and performance reviews through native subagent mechanisms.
- Constraints: OpenCode and Claude; least privilege; central logic not duplicated.
- Acceptance: runtime CLIs discover agents; independent reviews execute.
- Risks: runtime syntax drift; false PASS without evidence.
- Dependencies: installed OpenCode/Claude runtimes.

## Scope

Runtime wrappers, delegation rules, structured findings, unsupported-runtime fallback.

## Out of Scope

Custom agent framework, reviewer write access, app implementation.

## Acceptance Criteria

- [x] project-lead can invoke all three reviewers (native Task permission; runtime evidence in handoff).
- [x] Reviewers use reasonable least privilege (no edit/write/bash/task/skill).
- [x] Scope/architecture cannot change silently (central reviewer policy).
- [x] Findings use BLOCKER/P0/P1/P2/P3 with evidence.
- [x] Self-review is not independent.
- [x] Unsupported-runtime fallback is documented.
- [x] Central reviewer logic remains under `.agents/`.
- [x] OpenCode and Claude runtime definitions are validated.

## Implementation Plan

Create thin native wrappers; document runtime mapping/fallback; validate discovery; execute independent reviews.

## State History

| Date | From | To | Authority | Evidence |
|---|---|---|---|---|
| 2026-08-31 | — | DRAFT | project-lead | Audit finding |
| 2026-08-31 | DRAFT | READY | project-lead | Runtime scope refined |
| 2026-08-31 | READY | ACCEPTED | Juan | Foundation iteration instruction |
| 2026-09-01 | ACCEPTED | IMPLEMENTED | project-lead | Runtime discovery and review execution |
