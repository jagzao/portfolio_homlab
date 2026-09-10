import { describe, expect, it } from 'vitest'
import { StaticKnowledgeClient } from './client'

describe('StaticKnowledgeClient (ADR-005)', () => {
  it('returns neutral absence rather than invented content when no profile is published', async () => {
    const client = new StaticKnowledgeClient()
    expect(await client.getProfile()).toBeNull()
  })

  it('returns an empty list rather than invented content when no capabilities are published', async () => {
    const client = new StaticKnowledgeClient()
    expect(await client.listCapabilities()).toEqual([])
  })
})
