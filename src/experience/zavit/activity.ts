import type { ZavitState } from './ZavitEyeColor'

/**
 * Pure animation state for Zavit's purposeful idle activity (US-010: "On
 * arrival, Zavit is performing a purposeful activity"). While idle, Zavit
 * works on a small repair console in front of it: hands reach toward the
 * panel, the panel screen cycles, and a status light blinks. When Zavit
 * notices/greets the visitor it stops working and becomes attentive.
 *
 * Kept framework-free so it is unit-testable without a WebGL context.
 *
 * Reduced motion (ADR-002) removes the continuous animation but keeps the
 * content: the console stays visible in a static "working" pose (screen lit,
 * light on) rather than disappearing.
 */
export interface ActivityFrame {
  /** True while the hands are actively animating toward the console. */
  active: boolean
  /** 0..1 how far the hands reach toward the console (0 = at rest). */
  handLift: number
  /** 0..1 brightness of the console screen's "working" cycle. */
  panelGlow: number
  /** Whether the console status light is lit this instant. */
  statusOn: boolean
}

export function activityFrame(state: ZavitState, reducedMotion: boolean, time: number): ActivityFrame {
  const working = state === 'idle'
  if (!working) {
    // Attentive to the visitor: hands at rest, console powered down.
    return { active: false, handLift: 0, panelGlow: 0, statusOn: false }
  }
  if (reducedMotion) {
    // Static working pose: content present, no continuous motion.
    return { active: false, handLift: 0, panelGlow: 0.5, statusOn: true }
  }
  return {
    active: true,
    handLift: 0.5 + 0.5 * Math.sin(time * 1.2),
    panelGlow: 0.35 + 0.35 * Math.sin(time * 2.4),
    statusOn: Math.sin(time * 3) > 0,
  }
}
