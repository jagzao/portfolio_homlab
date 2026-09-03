import { describe, expect, it } from 'vitest'
import { frameAt, SIMULATION_DURATION_SECONDS, SIMULATION_FRAMES } from './simulation'

describe('frameAt', () => {
  it('returns the baseline frame at t=0', () => {
    expect(frameAt(0)).toBe(SIMULATION_FRAMES[0])
  })

  it('returns the correct frame between two timestamps (uses the most recent one reached)', () => {
    expect(frameAt(3)).toBe(SIMULATION_FRAMES[1]) // frame[1] at t=2, frame[2] at t=4
  })

  it('returns the exact frame when elapsed time matches its timestamp', () => {
    expect(frameAt(6)).toBe(SIMULATION_FRAMES[3])
  })

  it('returns the final (recovered) frame once elapsed time passes the whole sequence', () => {
    expect(frameAt(SIMULATION_DURATION_SECONDS + 5)).toBe(SIMULATION_FRAMES[SIMULATION_FRAMES.length - 1])
  })

  it('never returns undefined for negative or zero input', () => {
    expect(frameAt(-1)).toBe(SIMULATION_FRAMES[0])
  })
})

describe('SIMULATION_FRAMES', () => {
  it('starts and ends fully healthy (the failure is transient, not permanent)', () => {
    const first = SIMULATION_FRAMES[0]
    const last = SIMULATION_FRAMES[SIMULATION_FRAMES.length - 1]
    expect(Object.values(first.statuses).every((s) => s === 'normal')).toBe(true)
    expect(Object.values(last.statuses).every((s) => s === 'normal')).toBe(true)
    expect(first.circuitBreaker).toBe('closed')
    expect(last.circuitBreaker).toBe('closed')
    expect(last.errorRatePct).toBe(0)
  })

  it('is sorted by atSeconds (frameAt depends on this)', () => {
    for (let i = 1; i < SIMULATION_FRAMES.length; i++) {
      expect(SIMULATION_FRAMES[i].atSeconds).toBeGreaterThan(SIMULATION_FRAMES[i - 1].atSeconds)
    }
  })
})
