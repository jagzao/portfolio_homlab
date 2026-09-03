import { describe, expect, it } from 'vitest'
import { CAMPUS_BOUNDS, clampToBounds, isPointBlocked, isSegmentBlocked, nearestLandmarkId, stepToward } from './navigation'

describe('clampToBounds', () => {
  it('leaves an in-bounds point unchanged', () => {
    expect(clampToBounds({ x: 0, z: -10 }, CAMPUS_BOUNDS)).toEqual({ x: 0, z: -10 })
  })

  it('clamps a point outside the corridor to the nearest edge', () => {
    expect(clampToBounds({ x: 100, z: -1000 }, CAMPUS_BOUNDS)).toEqual({
      x: CAMPUS_BOUNDS.maxX,
      z: CAMPUS_BOUNDS.minZ,
    })
  })
})

describe('isPointBlocked', () => {
  const obstacles = [{ x: 0, z: -20, radius: 3 }]

  it('is false when the point is clear of every obstacle', () => {
    expect(isPointBlocked({ x: 10, z: 10 }, obstacles)).toBe(false)
  })

  it('is true when the point falls inside an obstacle radius', () => {
    expect(isPointBlocked({ x: 1, z: -21 }, obstacles)).toBe(true)
  })

  it('is true exactly at the boundary distance (< radius is strict, so on-edge counts as clear)', () => {
    expect(isPointBlocked({ x: 3, z: -20 }, obstacles)).toBe(false)
  })
})

describe('isSegmentBlocked', () => {
  const obstacles = [{ x: 0, z: -38, radius: 2.5 }]

  it('is false for a path that never comes near the obstacle', () => {
    expect(isSegmentBlocked({ x: -10, z: 0 }, { x: -10, z: -80 }, obstacles)).toBe(false)
  })

  it('is true for a clear endpoint whose straight-line path still crosses the obstacle', () => {
    // Endpoint is well past the obstacle and clear on its own, but the
    // direct line from start to end still passes through it.
    expect(isSegmentBlocked({ x: 0, z: -20 }, { x: 0, z: -60 }, obstacles)).toBe(true)
  })

  it('is false when the path passes beside the obstacle', () => {
    expect(isSegmentBlocked({ x: 6, z: -20 }, { x: 6, z: -60 }, obstacles)).toBe(false)
  })
})

describe('stepToward', () => {
  it('snaps directly to the target when reduced motion is on, regardless of distance', () => {
    const result = stepToward({ x: 0, z: 0 }, { x: 100, z: 100 }, 1, true)
    expect(result).toEqual({ x: 100, z: 100 })
  })

  it('moves at most maxStep per call when motion is not reduced', () => {
    const result = stepToward({ x: 0, z: 0 }, { x: 10, z: 0 }, 1, false)
    expect(result.x).toBeCloseTo(1)
    expect(result.z).toBeCloseTo(0)
  })

  it('reaches the target exactly once within maxStep, without overshooting', () => {
    const result = stepToward({ x: 0, z: 0 }, { x: 0.5, z: 0 }, 1, false)
    expect(result).toEqual({ x: 0.5, z: 0 })
  })
})

describe('nearestLandmarkId', () => {
  const landmarks = [
    { id: 'a', position: [0, 0, 0] as const },
    { id: 'b', position: [0, 0, -50] as const },
  ]

  it('picks the closest landmark by XZ distance', () => {
    expect(nearestLandmarkId({ x: 0, z: -2 }, landmarks)).toBe('a')
    expect(nearestLandmarkId({ x: 0, z: -48 }, landmarks)).toBe('b')
  })
})
