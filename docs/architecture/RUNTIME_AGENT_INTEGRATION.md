# Runtime Agent Integration

## Canonical instructions

Role behavior lives in `.agents/`. Runtime files are thin registrations and MUST NOT duplicate or
override central policy.

## OpenCode

- Primary: `.opencode/agent/project-lead.md` (`mode: primary`).
- Specialists: `.opencode/agent/{code,visual,performance}-reviewer.md` (`mode: subagent`).
- `project-lead` invokes specialists through OpenCode's Task tool.
- Specialists have read/search access for inspection; edit and nested Task
  permissions are denied. Foundation reviewers now deliberately have no `bash` access: runtime
  performance measurement is `NOT MEASURED` until an executable app exists. A future performance
  story must add narrowly scoped, read-only measurement commands or an external profiler.

## Claude Code

- Registrations: `.claude/agents/*.md`.
- `project-lead` invokes named specialists through Claude Code's Task tool.
- Specialists expose only `Read`, `Grep`, and `Glob`; no `Bash`, write, or edit tools.

## Independence

The implementing agent cannot count its own review as independent. Findings use `BLOCKER`, `P0`,
`P1`, `P2`, or `P3` and cite concrete evidence. Reviewers cannot silently change scope or architecture.

## Fallback

If a runtime cannot invoke subagents, stop automatic approval and record the missing independent
review in the handoff. Run each reviewer in a separate supported runtime/session using its central
`.agents/*-reviewer.md` instructions, attach findings, then continue. Never simulate a reviewer inside
the implementing session.

## Reproducible runtime evidence (2026-09-01)

OpenCode `1.18.25`:

```text
opencode --pure debug agent code-reviewer
mode=subagent; read=true; edit=false; write=false; bash=false; task=false; skill=false
opencode --pure debug agent visual-reviewer
mode=subagent; read=true; edit=false; write=false; bash=false; task=false; skill=false
opencode --pure debug agent performance-reviewer
mode=subagent; read=true; edit=false; write=false; bash=false; task=false; skill=false
```

`tools.invalid=true` is also emitted for built-in `explore` under the same `--pure` command, where
`read=true`, `edit=true`, and `bash=true`. This reproduces the flag independently of HomeLab
wrappers; it is a diagnostic-schema flag in this installed CLI, not an effective permission grant.
The effective reviewer permissions above are the security evidence. The project-lead Task smoke test
delegated all three named reviewers and returned results; see the Foundation handoff.
