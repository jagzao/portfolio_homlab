# Runtime Agent Integration

## Canonical instructions

Role behavior lives in `.agents/`. Runtime files are thin registrations and MUST NOT duplicate or
override central policy.

## OpenCode

- Primary: `.opencode/agent/project-lead.md` (`mode: primary`).
- Specialists: `.opencode/agent/{code,visual,performance}-reviewer.md` (`mode: subagent`).
- `project-lead` invokes specialists through OpenCode's Task tool.
- Specialists have read/search/command access for inspection and measurement; edit and nested Task
  permissions are denied.

## Claude Code

- Registrations: `.claude/agents/*.md`.
- `project-lead` invokes named specialists through Claude Code's Task tool.
- Specialists expose only `Read`, `Grep`, `Glob`, and `Bash`; no write/edit tools.

## Independence

The implementing agent cannot count its own review as independent. Findings use `BLOCKER`, `P0`,
`P1`, `P2`, or `P3` and cite concrete evidence. Reviewers cannot silently change scope or architecture.

## Fallback

If a runtime cannot invoke subagents, stop automatic approval and record the missing independent
review in the handoff. Run each reviewer in a separate supported runtime/session using its central
`.agents/*-reviewer.md` instructions, attach findings, then continue. Never simulate a reviewer inside
the implementing session.
