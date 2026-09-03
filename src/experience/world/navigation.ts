/**
 * Pure movement/collision math for the graybox journey, kept framework-free
 * so it is unit-testable without a WebGL context. PlayerController.tsx wires
 * these to R3F's pointer events and useFrame loop.
 */

export interface Point2D {
  x: number
  z: number
}

export interface Bounds {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

/** The walkable corridor. Keeps the visitor on the path — no wandering off into an unmodeled void. */
export const CAMPUS_BOUNDS: Bounds = { minX: -8, maxX: 8, minZ: -70, maxZ: 6 }

export function clampToBounds(point: Point2D, bounds: Bounds): Point2D {
  return {
    x: Math.min(bounds.maxX, Math.max(bounds.minX, point.x)),
    z: Math.min(bounds.maxZ, Math.max(bounds.minZ, point.z)),
  }
}

export interface CircleObstacle {
  x: number
  z: number
  radius: number
}

/** Solid graybox volumes a click-to-walk target may not land inside (portal posts, atrium tree, lab walls). */
export function isPointBlocked(point: Point2D, obstacles: CircleObstacle[]): boolean {
  return obstacles.some((o) => Math.hypot(point.x - o.x, point.z - o.z) < o.radius)
}

/**
 * One movement step toward a target. Reduced motion snaps instantly (a
 * single frame) instead of tweening, per ADR-002: reduced motion changes
 * how much a scene moves, never what content/position is reachable.
 */
export function stepToward(current: Point2D, target: Point2D, maxStep: number, reducedMotion: boolean): Point2D {
  if (reducedMotion) return target
  const dx = target.x - current.x
  const dz = target.z - current.z
  const distance = Math.hypot(dx, dz)
  if (distance <= maxStep || distance === 0) return target
  const ratio = maxStep / distance
  return { x: current.x + dx * ratio, z: current.z + dz * ratio }
}

/** Nearest landmark to a position, for the "you are here" orientation readout. */
export function nearestLandmarkId<T extends { id: string; position: readonly [number, number, number] }>(
  point: Point2D,
  landmarks: readonly T[],
): string {
  let bestId = landmarks[0].id
  let bestDist = Infinity
  for (const landmark of landmarks) {
    const [x, , z] = landmark.position
    const dist = Math.hypot(point.x - x, point.z - z)
    if (dist < bestDist) {
      bestDist = dist
      bestId = landmark.id
    }
  }
  return bestId
}
