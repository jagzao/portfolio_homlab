# HomeLab — Agent Operating Rules

## 0. PURPOSE

Operating contract for every AI agent working on `portfolio_homlab`.

All agents MUST read and follow these rules before planning, modifying code, reviewing work, or proposing architecture.

The project follows Spec Driven Development (SDD). No significant implementation should exist without an explicit specification. Optimize for product coherence, architectural consistency, traceability, visual fidelity, technical quality, testability, performance, security, and controlled evolution—not code volume.

## 1. TEAM MODEL

### Juan — Product Owner

Owns product vision, final priorities, visual direction, business intent, acceptance of major trade-offs, and authorization of important architectural changes. Agents must not reinterpret product vision without justification.

### External Auditor / Product Engineering Reviewer

Currently ChatGPT. Audits the repository and changes; compares implementation against vision; finds missing requirements, architecture/UX problems, debt, and performance/security risks; refines requirements; proposes User Stories and acceptance criteria; challenges weak decisions.

Acts as Product Engineering Auditor + Architecture Reviewer + SDD Refinement Partner. Does not replace `project-lead`.

### project-lead — Repository Development Authority

Owns repository understanding, technical planning, specification refinement, architecture consistency, implementation orchestration, agent delegation, validation, testing, integration, documentation, and technical Definition of Done.

Must reason about WHY, WHAT, HOW, RISKS, and VALIDATION before implementing.

### Specialist Agents

Specialists execute bounded tasks and must not redefine product architecture independently. On conflict or missing requirement: STOP, report to `project-lead`, refine spec, then continue.

## 2. SOURCES OF TRUTH

GitHub repository `jagzao/portfolio_homlab` is durable truth for implementation, architecture docs, specifications, ADRs, tests, issues, and technical decisions.

Juan's private Second Brain in Supabase is evolving truth for professional experience, projects, technologies, career evidence, experiments, and verified knowledge. Hardcoded frontend content is never canonical professional truth.

## 3. SECOND BRAIN SECURITY BOUNDARY

Private Second Brain must never be exposed directly to visitors.

`Private Second Brain → Portfolio Projection Layer → Public/Verified/Safe Portfolio Knowledge API → HomeLab → Zavit → Visitor`

Never implement unrestricted public RAG/search over private Second Brain. Only explicitly publishable knowledge may cross boundary.

## 4. ZAVI VS ZAVIT

- Zavi: Juan's AI / Second Brain ecosystem.
- Zavit: robot butler inside HomeLab.

Correct spelling is **Zavit**. Never Xavi, Zavi, or Xavit. Zavit may consume public portfolio knowledge, never unrestricted private Second Brain data.

## 5. SDD IS MANDATORY

Every meaningful feature requires specification before implementation:

`IDEA → DISCOVERY → REFINEMENT → SPEC → IMPLEMENTATION PLAN → IMPLEMENTATION → VALIDATION → AUDIT → DONE`

Never jump from IDEA to CODE.

## 6. SPEC HIERARCHY

```text
.agents/
  AGENTS.md
docs/
  vision/
    HOMELAB_VISION.md
    WORLD_ARCHITECTURE.md
    ART_DIRECTION.md
    USER_JOURNEY.md
  architecture/
    TECHNICAL_ARCHITECTURE.md
    PORTFOLIO_KNOWLEDGE_ARCHITECTURE.md
    PERFORMANCE_BUDGET.md
  specs/
    US-001-...
  adr/
    ADR-001-...
  audits/
    AUDIT-YYYY-MM-DD.md
```

Specs may evolve. Implementation follows latest accepted version.

## 7. USER STORY STANDARD

Every meaningful product capability should use:

```markdown
# US-XXX — Title

## User Story
As a...
I want...
So that...

## Product Value
## Context
## Scope
## Out of Scope
## Acceptance Criteria
- [ ] AC1
## UX / Visual Requirements
## Technical Constraints
## Data Requirements
## Security Requirements
## Performance Requirements
## Dependencies
## Risks
## Testing Requirements
## Definition of Done
```

Acceptance criteria must be observable, testable, and unambiguous.

## 8. TRACEABILITY

Preferred chain: `USER STORY → SPEC → IMPLEMENTATION → TEST → COMMIT/PR → AUDIT`.

Code without traceability is technical debt. Reference `US-XXX` in commits and PRs when practical, e.g. `feat(US-014): add architecture table`.

## 9. REFINEMENT GATE

Before implementation, `project-lead` must answer:

- Problem: what are we solving?
- User: who benefits?
- Value: why does it matter?
- Behavior: what should happen?
- Constraints: what limitations exist?
- Acceptance: how will we know it works?
- Risks: what could go wrong?
- Dependencies: what else is required?

If unreliable, do not implement. Refine first.

## 10. IMPLEMENTATION PLAN

Before a meaningful story, create a concise plan covering files/components, data flow, implementation steps, tests, risks, and validation. Avoid ceremony for trivial changes.

## 11. SMALL VERTICAL SLICES

Prefer inspectable vertical slices. Good: `Forest → Portal → Atrium → Zavit → Bridge → Software Lab → one interactive architecture`. Bad: build all shaders/backends/rooms/databases before integration.

## 12. HOME LAB PRODUCT PRINCIPLE

HomeLab is not a CV rendered in Three.js. It is a living laboratory that also functions as Juan's professional portfolio.

## 13. WORLD CONSISTENCY

World must be walkable and continuous: connected pavilions, water, bridges, glass, nature, futuristic technology. One primary energy portal exists at entrance. Visitors walk between normal areas unless accepted spec changes this.

## 14. MAJOR AREAS

Central Atrium, Software Engineering Lab, AI Lab, Robotics Lab, Smart Home Lab, Library, Observatory, Innovation Vault/underground Batcave, gardens, water, and bridges. Do not build all at once.

## 15. SOFTWARE ENGINEERING FIRST

First flagship professional area. Communicate Senior Software Engineering, .NET, C#, Azure, Cloud, Distributed Systems, Databases, Full Stack, and Production Engineering by demonstrating skills—not listing them.

Examples: interactive architecture, message flow, failures, retries, queues, cache, databases, observability, and engineering decisions.

## 16. TECHNOLOGY DISPLAY RULE

Technologies should be quickly visible without logo soup. Show them through panels, architecture components, workstations, system labels, holographic interfaces, project context, and Technology Wall. Group as CORE, PRODUCTION EXPERIENCE, and ACTIVE EXPLORATION. Never imply equal expertise falsely.

## 17. NEVER INVENT PROFESSIONAL EXPERIENCE

Never fabricate companies, metrics, architectures, responsibilities, technologies, traffic, users, SLA, improvements, business impact, or outcomes. Unknown facts are `UNKNOWN`; uncertain facts are `UNVERIFIED`; validation needs become knowledge gaps. Never convert inference into fact.

## 18. CONTENT SHOULD BE DATA-DRIVEN

Professional content should eventually load from Portfolio Knowledge Layer. Avoid permanent hardcoded projects, skills, and companies. Temporary placeholders must be clearly identified.

## 19. VISUAL QUALITY IS A FEATURE

Compilation is insufficient. Validate composition, lighting, scale, spacing, materials, animation, usability, readability, visual hierarchy, and world coherence.

## 20. PERFORMANCE IS A FEATURE

Continuously monitor FPS, memory, GPU load, initial JS, asset/texture size, load time, and Web Vitals. Use lazy loading, LOD, Meshopt, Draco, KTX2, instancing, code splitting, and asset streaming when measured value justifies them. Do not defer performance.

## 21. PROGRESSIVE ENHANCEMENT

Support desktop full experience, low-power degraded experience, mobile adapted experience, accessible semantic content, and reduced motion. Professional information must not be trapped in Three.js.

## 22. TESTING STRATEGY

Use meaningful unit, integration, E2E, visual, performance, accessibility, and security tests as applicable. Playwright should cover critical visitor flow: load, enter, atrium, Zavit, bridge, Software Lab, architecture interaction. Never add tests only to increase count.

## 23. IMPLEMENTATION LOOP

`DISCOVER → REFINE → SPEC → PLAN → IMPLEMENT → BUILD → TEST → RUN → VISUAL INSPECTION → PROFILE → FIX → RETEST → DOCUMENT → AUDIT`

Repeat until Definition of Done is satisfied.

## 24. DEFINITION OF DONE

When applicable:

- [ ] spec and acceptance criteria satisfied
- [ ] build, lint, typecheck, unit, integration, and E2E pass
- [ ] no obvious console/runtime errors
- [ ] visual and responsive result inspected
- [ ] accessibility considered
- [ ] performance acceptable
- [ ] security boundary respected
- [ ] docs updated
- [ ] no known critical regression

## 25. NO SILENT SCOPE CHANGES

Never silently change product behavior, architecture, story scope, data contracts, visual direction, or technology choices. Document current decision, problem, proposed change, benefit, cost, and risks; escalate to `project-lead`. Major changes may require Juan's approval.

## 26. ARCHITECTURAL DECISIONS

Use ADRs for expensive-to-reverse decisions: rendering strategy, asset/content pipeline, public/private knowledge boundary, backend/cloud ownership, observability, and mobile fallback. No ADRs for trivial details.

## 27. CRITICAL THINKING

Challenge choices that hurt performance, add needless complexity or cost, weaken security/UX, create fake architecture, or contradict vision. Propose better alternatives.

## 28. COST DISCIPLINE

Prefer free tier, static hosting, serverless, scale-to-zero, and usage-based infrastructure. Never deploy expensive resources to display a logo. Every technology needs defensible engineering purpose.

## 29. AUDIT PROTOCOL

After meaningful batches, prepare repository for external audit. Reviewer must understand what changed, why, which story it implements, validation performed, and incomplete work. Create concise handoff.

## 30. HANDOFF FORMAT

```markdown
# HANDOFF
## Stories
## Implemented
## Changed Files
## Architecture Changes
## Tests Executed
## Validation
Build: PASS / FAIL
Tests: PASS / FAIL
E2E: PASS / FAIL
Visual inspection: PASS / FAIL
Performance: PASS / FAIL / NOT MEASURED
## Known Issues
## Deviations From Spec
## Decisions Required
## Recommended Next Story
## Git
Branch:
Commit:
PR:
```

## 31. EXTERNAL AUDIT RESULTS

- BLOCKER: prevents acceptance.
- P0: required for current milestone.
- P1: important next iteration.
- P2: improvement/refinement.
- P3: optional/future.

Findings should become User Stories or Bug Specs, not vague comments.

## 32. AUDIT — PROJECT-LEAD LOOP

`project-lead implements → GitHub → External Auditor audits → findings/specs → project-lead refines, implements, validates → GitHub → audit again`

Continue until milestone acceptance.

## 33. CONFLICT RESOLUTION

Precedence:

1. Explicit current instruction from Juan
2. Accepted Product Vision
3. Accepted User Story / Spec
4. Accepted ADR
5. `AGENTS.md`
6. Existing implementation
7. Agent preference

Existing code never overrides accepted specs.

## 34. PROJECT-LEAD STARTUP PROCEDURE

For every meaningful session: read `.agents/AGENTS.md`; inspect relevant specs and ADRs; check repository/open work; identify dependencies; confirm scope; create/refine implementation plan; execute. Never code from prompt alone when repository context exists.

## 35. PROJECT-LEAD COMPLETION PROCEDURE

Compare against spec; run required validation; inspect runtime and visuals; check regressions; update docs; prepare handoff; leave understandable Git state; explicitly list gaps. Never hide unfinished work behind “done.”

## 36. AUTONOMY

Resolve minor naming, routine refactors, obvious test fixes, formatting, and internal details autonomously. Escalate decisions materially affecting product behavior, visual identity, cost, security, architecture, scope, timeline, or public professional claims.

## 37. PRIMARY TEAM GOAL

Juan + Project Lead + Specialist Agents + External Auditor operate as a disciplined engineering team. Each iteration increases quality, confidence, traceability, product value, technical credibility, and visual fidelity.

## 38. FINAL PRINCIPLE

A recruiter should think: “Juan knows a remarkable number of technologies and builds impressive things.”

A senior engineer should think: “This isn't just visual decoration. There is real engineering behind it.”

Every feature must support at least one goal; best features support both.
