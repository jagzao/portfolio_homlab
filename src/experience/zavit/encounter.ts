import type { Point2D } from '../world/navigation'
import { ZAVIT_POSITION, NOTICE_RADIUS } from './zavitConfig'

export type EncounterPhase = 'idle' | 'noticing' | 'greeting' | 'dismissed'

/** Pure distance check, kept separate from the noticing->greeting timer for testability. */
export function isWithinNoticeRadius(position: Point2D): boolean {
  return Math.hypot(position.x - ZAVIT_POSITION.x, position.z - ZAVIT_POSITION.z) <= NOTICE_RADIUS
}

/**
 * Next encounter phase given current phase and proximity. A one-shot
 * encounter: once `dismissed`, walking away and back does not retrigger it
 * (MASTER_BACKLOG M4: "does not trap visitor in dialogue").
 */
export function nextEncounterPhase(current: EncounterPhase, withinRadius: boolean): EncounterPhase {
  if (current === 'dismissed' || current === 'greeting') return current
  if (current === 'noticing') return current // advances to 'greeting' on a timer, not proximity
  if (current === 'idle' && withinRadius) return 'noticing'
  return 'idle'
}
