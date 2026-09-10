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

// Portal posts + atrium tree trunk: solid graybox volumes a click-to-walk
// target may not land inside, or a straight-line path may not cross.
export const CAMPUS_OBSTACLES: CircleObstacle[] = [
  { x: -3, z: -22, radius: 1 }, // portal post (left)
  { x: 3, z: -22, radius: 1 }, // portal post (right)
  // Atrium tree (trunk + canopy footprint). Off the x=0 centerline (was
  // centered) so it no longer sits directly on every north-south landmark
  // hop (Atrium -> Bridge, both at x=0) - that straight line used to run
  // right through the trunk for Guided Mode/landmark-jump movement, which
  // (unlike click-to-walk and keyboard nudge) never routed around obstacles.
  { x: -3, z: -38, radius: 2.5 },
]

/** Solid graybox volumes a click-to-walk target may not land inside. */
export function isPointBlocked(point: Point2D, obstacles: CircleObstacle[]): boolean {
  return obstacles.some((o) => Math.hypot(point.x - o.x, point.z - o.z) < o.radius)
}

/** Shortest distance from a point to a line segment. */
function distanceToSegment(p: Point2D, a: Point2D, b: Point2D): number {
  const dx = b.x - a.x
  const dz = b.z - a.z
  const lengthSquared = dx * dx + dz * dz
  if (lengthSquared === 0) return Math.hypot(p.x - a.x, p.z - a.z)
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.z - a.z) * dz) / lengthSquared))
  const projX = a.x + t * dx
  const projZ = a.z + t * dz
  return Math.hypot(p.x - projX, p.z - projZ)
}

/**
 * True if the straight path from `a` to `b` passes through any obstacle —
 * catches the case an endpoint check alone misses: a clear target on the
 * far side of an obstacle sitting mid-route (e.g. the atrium tree, which
 * sits on the corridor centerline most north-south travel uses).
 */
export function isSegmentBlocked(a: Point2D, b: Point2D, obstacles: CircleObstacle[]): boolean {
  return obstacles.some((o) => distanceToSegment(o, a, b) < o.radius)
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
