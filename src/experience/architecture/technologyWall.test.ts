import { describe, expect, it } from 'vitest'
import { hasVerifiedCapabilities, TECHNOLOGY_CATEGORIES } from './technologyWall.data'
import type { CapabilityRecord } from '../../content/types'

describe('hasVerifiedCapabilities', () => {
  it('is false for the current empty public artifact (no fabricated classifications)', () => {
    expect(hasVerifiedCapabilities([])).toBe(false)
  })

  it('is true when verified capability records exist', () => {
    const capabilities: CapabilityRecord[] = [
      {
        id: 'cap-1',
        revision: 1,
        verification: 'VERIFIED',
        publication: 'PUBLISHED',
        publishedAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        display: { label: 'TypeScript', category: 'CORE' },
        evidence: [],
      },
    ]
    expect(hasVerifiedCapabilities(capabilities)).toBe(true)
  })
})

describe('TECHNOLOGY_CATEGORIES', () => {
  it('exposes the three accepted classification buckets in order', () => {
    expect(TECHNOLOGY_CATEGORIES).toEqual(['CORE', 'PRODUCTION_EXPERIENCE', 'ACTIVE_EXPLORATION'])
  })
})
