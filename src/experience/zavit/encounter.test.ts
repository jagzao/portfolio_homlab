import { describe, expect, it } from 'vitest'
import { isWithinNoticeRadius, nextEncounterPhase } from './encounter'
import { ZAVIT_POSITION } from './zavitConfig'

describe('isWithinNoticeRadius', () => {
  it('is true at Zavit\'s exact position', () => {
    expect(isWithinNoticeRadius({ x: ZAVIT_POSITION.x, z: ZAVIT_POSITION.z })).toBe(true)
  })

  it('is false far away', () => {
    expect(isWithinNoticeRadius({ x: 0, z: 4 })).toBe(false)
  })
})

describe('nextEncounterPhase', () => {
  it('stays idle while out of radius', () => {
    expect(nextEncounterPhase('idle', false)).toBe('idle')
  })

  it('moves from idle to noticing once in radius', () => {
    expect(nextEncounterPhase('idle', true)).toBe('noticing')
  })

  it('never regresses out of noticing due to proximity alone (advances on a timer instead)', () => {
    expect(nextEncounterPhase('noticing', false)).toBe('noticing')
  })

  it('never retriggers after dismissed, even back in radius', () => {
    expect(nextEncounterPhase('dismissed', true)).toBe('dismissed')
  })

  it('never regresses out of greeting due to walking away', () => {
    expect(nextEncounterPhase('greeting', false)).toBe('greeting')
  })
})
