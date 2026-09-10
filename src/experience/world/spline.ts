import type { Point2D } from './navigation'

/**
 * Pure spline math for the Guided Mode camera path, kept framework-free so
 * it is unit-testable without a WebGL context (same contract as
 * navigation.ts). A Catmull-Rom spline passes through every control point
 * (the journey landmarks) and gives a smooth curve between them, which is
 * the "fixed spline with waypoint stops" the Movement and Input Model calls
 * for — versus the previous straight-line hop.
 *
 * The journey landmarks are all on the corridor centerline (x=0), so the
 * spline through them is necessarily a straight vertical line; the curve
 * structure is what matters here (and becomes visibly curved the moment a
 * landmark leaves the centerline), and it never routes through an obstacle.
 */

/**
 * Sample the Catmull-Rom spline segment between `points[k]` and
 * `points[k+1]` at local parameter `t` in [0, 1]. `k` must be within
 * [0, points.length - 2].
 */
export function sampleCatmullRomSegment(points: Point2D[], k: number, t: number): Point2D {
  const p0 = points[Math.max(0, k - 1)]
  const p1 = points[k]
  const p2 = points[k + 1]
  const p3 = points[Math.min(points.length - 1, k + 2)]

  const t2 = t * t
  const t3 = t2 * t

  const x =
    0.5 *
    (2 * p1.x +
      (-p0.x + p2.x) * t +
      (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
      (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3)
  const z =
    0.5 *
    (2 * p1.z +
      (-p0.z + p2.z) * t +
      (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 +
      (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3)

  return { x, z }
}

/**
 * Build a dense polyline sampling the full spline through every control
 * point (landmark). Each control point is included exactly once as a
 * waypoint (at `t = 0` of its segment), so walking this path stops at every
 * landmark. `samplesPerSpan` controls the smoothness per segment.
 */
export function buildSplinePath(points: Point2D[], samplesPerSpan = 12): Point2D[] {
  const path: Point2D[] = []
  for (let k = 0; k < points.length - 1; k++) {
    for (let i = 0; i < samplesPerSpan; i++) {
      path.push(sampleCatmullRomSegment(points, k, i / samplesPerSpan))
    }
  }
  path.push(points[points.length - 1])
  return path
}

/**
 * Subset of a prebuilt spline path running from the waypoint nearest to
 * `from` up to (and including) the waypoint at control-point (landmark)
 * index `toIndex`. Lets Guided Mode advance along the spline to a specific
 * stop without rewinding through earlier ones.
 */
export function sliceSplinePathToIndex(
  path: Point2D[],
  from: Point2D,
  toIndex: number,
  samplesPerSpan: number,
): Point2D[] {
  const targetIndex = toIndex * samplesPerSpan
  let nearest = 0
  let bestDist = Infinity
  for (let i = 0; i <= targetIndex; i++) {
    const dist = Math.hypot(from.x - path[i].x, from.z - path[i].z)
    if (dist < bestDist) {
      bestDist = dist
      nearest = i
    }
  }
  return path.slice(nearest, targetIndex + 1)
}
