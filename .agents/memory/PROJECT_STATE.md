# HomeLab — Durable Project State

Last updated: 2026-09-02
Owner: Juan
External Auditor: ChatGPT

## Purpose

This file is coordination memory for agents. It summarizes current state so a new agent/session can continue without reconstructing conversation history.

It does **not** replace accepted product specs, ADRs, or `.agents/AGENTS.md`. When a conflict exists, follow the precedence defined in `.agents/AGENTS.md`.

## Repository

- Repo: `jagzao/portfolio_homlab`
- Foundation PR: `#1`
- Foundation branch: `foundation/sdd-agent-workflow`
- Foundation base: `main`

## Current gate

Foundation corrections for External Audit review `5080741521` have been pushed. The branch currently requires External Re-Audit before merge.

Do not start UI implementation from this branch until Foundation is `AUDITED` and merged according to `docs/architecture/DELIVERY_WORKFLOW.md`.

## Foundation audit history

Initial External Audit result: `CHANGES REQUIRED`.

Required fixes included:

- make specialist reviewers genuinely read-only;
- prove native Task/subagent invocation end-to-end;
- make lifecycle headers/checklists consistent;
- fix canonical `CONTENT_MODEL.md` reference;
- strengthen foundation validation;
- document the OpenCode `tools.invalid` diagnostic without inventing a fix.

The current branch reports those findings resolved and is waiting for External Re-Audit.

## Product identity

HomeLab is a living personal research laboratory that also functions as Juan's professional portfolio. It is not a CV rendered in Three.js.

The experience must make two audiences believe two things at once:

- recruiter: Juan knows and uses a broad modern engineering stack and builds impressive systems;
- senior engineer: the visual experience is backed by credible engineering, trade-offs, testing, performance, security, and evidence.

## World identity

- one continuous walkable world;
- only one primary energy portal: the entrance;
- forest/nature approach;
- campus/pavilions over water;
- bridges connect sections;
- glass architecture, black metal, subtle gold;
- nature remains visible inside professional spaces;
- vertical gardens and fruit-bearing plants are part of the environment;
- transparent roofs expose sky by day and stars/deep sky by night;
- no internal teleport portals unless a future accepted spec changes this.

Planned areas:

- Central Atrium;
- Software Engineering Lab first;
- AI Lab;
- Robotics Lab;
- Smart Home Lab;
- Library;
- Observatory;
- Innovation Vault / underground Batcave;
- gardens, water, bridges, second floor.

Future areas are not automatically in scope for the first UI alpha.

## Zavi and Zavit

These are different concepts.

- **Zavi**: Juan's private AI / Second Brain ecosystem.
- **Zavit**: the HomeLab robot butler/host.

Exact robot identity for Zavit:

- mostly black body;
- white belly screen;
- illuminated expressive eyes whose color changes by state;
- buttons on the head;
- red claw/pincer hands;
- retro-futuristic, nostalgic, friendly, intelligent;
- should be doing something purposeful when the visitor arrives, not waiting like a static receptionist.

Final high-fidelity proportions/model remain pending a stronger visual reference from Juan. A clearly labeled placeholder is acceptable in the first slice.

## First professional area

Software Engineering Lab is the first flagship area.

Concepts already accepted at product level:

- Architecture Table;
- Engineering Decisions Wall;
- Technology Wall;
- Current Workbench;
- Flagship Projects;
- architecture/failure simulation;
- semantic equivalent outside WebGL.

Core professional direction includes `.NET`, C#, Azure, Cloud, SQL Server, PostgreSQL, React, and TypeScript. Other technologies must appear according to verified public evidence. Python must not be visually presented as equal mastery without evidence; current product direction treats it as active/growing exploration unless public evidence supports a stronger classification.

## Second Brain boundary

Supabase Second Brain project: `oweqrcmxmmxzyahyleap`.

Never expose the private Second Brain directly to browser visitors or Zavit.

Required boundary:

`Private Second Brain -> verification/sanitization/publication -> Public Portfolio Projection -> HomeLab/Zavit -> Visitor`

Only `VERIFIED + PUBLISHED` claims may be presented as factual professional claims. No unrestricted public RAG/search against private knowledge.

The public projection must evolve as Juan's Second Brain evolves, but freshness must never override privacy or publication approval.

## UI alpha target

The first audit-ready executable UI should be an inspectable vertical slice, not the whole campus.

Target journey:

`semantic shell -> forest approach -> HomeLab exterior -> one energy portal -> Central Atrium -> active Zavit placeholder -> guided/free choice -> bridge over water -> Software Engineering Lab -> interactive architecture/failure demonstration`

The slice must include a usable semantic/mobile/reduced-motion fallback. Essential professional content cannot be trapped inside WebGL.

## Visual target

Use the accepted concept direction:

- premium futuristic research facility;
- warm and inhabited rather than sterile;
- strong nature integration;
- black + subtle gold + green + white with restrained red robotics accents;
- glass, water, reflections, vegetation;
- restrained holographic UI;
- no logo soup;
- no excessive bloom/particles/neon;
- visual hierarchy and readability before effects.

## Technical direction

Current frontend candidate: React + TypeScript + Three.js, likely React Three Fiber, but final rendering ownership requires accepted ADR/spike evidence.

Do not add ASP.NET Core, PostgreSQL, Python, Azure, AWS, or other backend/cloud services simply to display technologies. Each service must support an accepted capability and have a defensible cost/security reason.

## Performance/accessibility principles

- semantic shell loads independently of 3D;
- 3D is progressive enhancement;
- mobile may use adapted 3D or semantic mode;
- reduced motion must preserve information;
- keyboard-accessible equivalents are required;
- WebGL failure cannot block portfolio content;
- measure before optimization;
- provisional budgets live in `docs/architecture/PERFORMANCE_BUDGET.md`.

## Coordination backlog

The durable execution roadmap is `.agents/tasks/MASTER_BACKLOG.md`.

Project Lead startup must read:

1. `.agents/AGENTS.md`;
2. this file;
3. `.agents/tasks/MASTER_BACKLOG.md`;
4. relevant accepted specs/ADRs;
5. current branch/PR state.

The roadmap is coordination input. Before meaningful implementation, convert/refine the active item into an accepted `docs/specs/US-XXX-*.md` as required by SDD.
