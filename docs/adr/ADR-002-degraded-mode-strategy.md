# ADR-002 — Progressive Enhancement and Degraded/Mobile Strategy

Status: `ACCEPTED` (project-lead technical authority; presented for visibility at the `US-010` acceptance gate)
Traceability: `US-010`, `docs/architecture/PERFORMANCE_BUDGET.md`, `docs/architecture/TECHNICAL_ARCHITECTURE.md`
Date: 2026-09-02

## Context

`docs/architecture/PERFORMANCE_BUDGET.md` already defines provisional runtime quality-scaling *triggers* (frame-time breach → reduce quality → semantic fallback) but not the **entry-time capability decision** that picks a visitor's starting tier, nor the exact signals used. `M1` requires this decision before implementation.

## Decision

### Entry-time tier selection (evaluated once on load, not polled)

1. **WebGL support probe.** No WebGL2/WebGL1 context available → semantic mode is mandatory; no retry loop, immediate full-content fallback with a visible "3D unavailable — showing full content" notice.
2. **`prefers-reduced-motion`.** If set, 3D remains available but forced camera sweeps/continuous decorative motion and cinematic transitions are replaced with cuts; information is never removed, only motion.
3. **Data saver / slow network.** `navigator.connection.saveData` true, or `effectiveType` in `{slow-2g, 2g, 3g}` → default to semantic mode with a manual "Try 3D" opt-in; never auto-load the 3D chunk.
4. **Mobile heuristic.** Coarse pointer (`matchMedia('(pointer: coarse)')`) and viewport width < 768px → Adapted 3D tier by default (reduced pixel ratio, shadows, reflections, geometry detail) unless WebGL is absent (falls to rule 1).
5. **Low-capability desktop.** `navigator.deviceMemory < 4` (when available) or `hardwareConcurrency <= 4` → Adapted tier even on desktop form factors.

Any signal unavailable in a given browser is treated as "unknown, do not restrict" — detection degrades toward permissiveness, never toward silently blocking content.

### Runtime fallback (after entry)

Reuses `docs/architecture/PERFORMANCE_BUDGET.md`'s existing triggers and Quality Scaling order unchanged: sustained frame-time breaches step down pixel ratio/shadows, then reflections/particles/vegetation/animation frequency, then LOD/texture quality, and only if the minimum interaction path still misses budget after all visual reductions does the experience switch to semantic mode — always with a visible, dismissible notice, never a silent blank screen.

### WebGL failure after entry

A lost/failed WebGL context is caught and immediately renders semantic mode with the same "3D unavailable" notice used for the entry-time case. No retry loop blocks content.

## Alternatives Considered

- **User-agent sniffing.** Rejected — unreliable and contradicts capability-based progressive enhancement (AGENTS.md §21).
- **Always attempt full 3D, fallback only on measured failure.** Rejected as the sole strategy — burns battery/bandwidth on devices already signaling low capability (data saver, coarse pointer + small viewport, low `deviceMemory`) before they get a chance to render a frame. The chosen approach still allows an explicit "Try 3D" opt-in on constrained connections, so a capable device on a throttled network is never permanently locked out.

## Consequences

- Capability-detection utility must ship in the semantic shell itself (`M2`), adding an estimated 1–3 KB to the shell bundle — within the 170 KB shell JS budget.
- Real frame-time sampling (`PERFORMANCE_BUDGET.md`'s runtime triggers) must be instrumented before `M8` measurement can validate this ADR's runtime-fallback path; entry-time tier selection can be validated earlier (`M2`/`M3`).
- Satisfies `docs/architecture/TECHNICAL_ARCHITECTURE.md`'s "mobile/degraded-mode threshold" item under "Required Decisions Before US-010 Implementation."
