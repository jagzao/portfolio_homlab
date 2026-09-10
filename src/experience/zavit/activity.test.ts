import { describe, expect, it } from 'vitest'
import { activityFrame } from './activity'

describe('activityFrame', () => {
  it('is active and animating while idle (no reduced motion)', () => {
    const a = activityFrame('idle', false, 0)
    const b = activityFrame('idle', false, 1)
    expect(a.active).toBe(true)
    expect(a.handLift).toBeGreaterThanOrEqual(0)
    expect(a.handLift).toBeLessThanOrEqual(1)
    expect(a.panelGlow).toBeGreaterThan(0)
    // The animation actually moves over time, not a static pose.
    expect(b.handLift).not.toBe(a.handLift)
  })

  it('stops working (attentive) when noticing', () => {
    const frame = activityFrame('noticing', false, 0)
    expect(frame.active).toBe(false)
    expect(frame.handLift).toBe(0)
    expect(frame.panelGlow).toBe(0)
    expect(frame.statusOn).toBe(false)
  })

  it('stops working (attentive) when greeting', () => {
    const frame = activityFrame('greeting', false, 0)
    expect(frame.active).toBe(false)
    expect(frame.handLift).toBe(0)
    expect(frame.panelGlow).toBe(0)
    expect(frame.statusOn).toBe(false)
  })

  it('keeps the console visible in a static working pose under reduced motion', () => {
    const frame = activityFrame('idle', true, 0)
    expect(frame.active).toBe(false)
    expect(frame.panelGlow).toBeGreaterThan(0)
    expect(frame.statusOn).toBe(true)
  })

  it('is fully off under reduced motion when not idle', () => {
    const frame = activityFrame('greeting', true, 0)
    expect(frame.active).toBe(false)
    expect(frame.handLift).toBe(0)
    expect(frame.panelGlow).toBe(0)
    expect(frame.statusOn).toBe(false)
  })
})
