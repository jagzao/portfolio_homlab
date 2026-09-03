import { CAMPUS_OBSTACLES, type CircleObstacle } from './navigation'
import { ZAVIT_POSITION } from '../zavit/zavitConfig'

/**
 * Single source of truth for "solid" collision, shared by click-to-walk
 * (WorldScene) and keyboard nudge (Experience3D) — previously each defined
 * its own list and drifted (keyboard movement could walk through Zavit).
 */
export const JOURNEY_OBSTACLES: CircleObstacle[] = [
  ...CAMPUS_OBSTACLES,
  { x: ZAVIT_POSITION.x, z: ZAVIT_POSITION.z, radius: 0.8 },
]
