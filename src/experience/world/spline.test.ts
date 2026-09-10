import { describe, expect, it } from 'vitest'
import { buildSplinePath, sampleCatmullRomSegment, sliceSplinePathToIndex } from './spline'
import { LANDMARKS } from './landmarks'

const LANDMARK_POINTS = LANDMARKS.map((l) => ({ x: l.position[0], z: l.position[2] }))

describe('sampleCatmullRomSegment', () => {
  it('returns the control point exactly at t=0 and t=1', () => {
    const points = [
      { x: 0, z: 0 },
      { x: 0, z: -30 },
      { x: 0, z: -60 },
    ]
    expect(sampleCatmullRomSegment(points, 0, 0)).toEqual({ x: 0, z: 0 })
    expect(sampleCatmullRomSegment(points, 0, 1)).toEqual({ x: 0, z: -30 })
  })

  it('stays between the segment endpoints for t in (0, 1)', () => {
    const points = [
      { x: 0, z: 0 },
      { x: 0, z: -30 },
      { x: 0, z: -60 },
    ]
    const mid = sampleCatmullRomSegment(points, 0, 0.5)
    expect(mid.z).toBeGreaterThan(-30)
    expect(mid.z).toBeLessThan(0)
    expect(mid.x).toBeCloseTo(0)
  })

  it('is monotonic along the z-axis for collinear landmarks (a straight corridor)', () => {
    const samples = buildSplinePath(LANDMARK_POINTS, 20)
    for (let i = 1; i < samples.length; i++) {
      expect(samples[i].z).toBeLessThanOrEqual(samples[i - 1].z + 1e-9)
      expect(samples[i].x).toBeCloseTo(0)
    }
  })
})

describe('buildSplinePath', () => {
  it('includes every landmark exactly once, ending on the last one', () => {
    const samples = buildSplinePath(LANDMARK_POINTS, 12)
    expect(samples[samples.length - 1]).toEqual(LANDMARK_POINTS[LANDMARK_POINTS.length - 1])
    // Each control point appears at index k * samplesPerSpan.
    LANDMARK_POINTS.forEach((landmark, k) => {
      expect(samples[k * 12]).toEqual(landmark)
    })
  })

  it('has the expected length for a given sample rate', () => {
    const samples = buildSplinePath(LANDMARK_POINTS, 12)
    expect(samples).toHaveLength((LANDMARK_POINTS.length - 1) * 12 + 1)
  })
})

describe('sliceSplinePathToIndex', () => {
  const path = buildSplinePath(LANDMARK_POINTS, 12)

  it('slices from the waypoint nearest to `from` up to and including the target landmark', () => {
    // Starting near the start of the spline, going to landmark index 3 (Atrium).
    const sliced = sliceSplinePathToIndex(path, LANDMARK_POINTS[0], 3, 12)
    expect(sliced[0].x).toBeCloseTo(LANDMARK_POINTS[0].x)
    expect(sliced[sliced.length - 1]).toEqual(LANDMARK_POINTS[3])
  })

  it('never includes waypoints past the target landmark', () => {
    const sliced = sliceSplinePathToIndex(path, LANDMARK_POINTS[0], 1, 12)
    expect(sliced[sliced.length - 1]).toEqual(LANDMARK_POINTS[1])
    // Target landmark index 1 is the 12th waypoint; nothing past it.
    expect(sliced).toHaveLength(13)
  })
})
