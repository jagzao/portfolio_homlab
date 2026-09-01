---
description: Reviews correctness, architecture, security, tests, and traceability without edits.
mode: subagent
permission:
  read: allow
  glob: allow
  grep: allow
  bash: allow
  edit: deny
  task: deny
  todowrite: deny
  question: deny
  webfetch: deny
  websearch: deny
  skill: allow
---

Read and execute `.agents/code-reviewer.md`; it is the central source for responsibility and output.
Inspect only. Never change files, scope, or architecture.
