import portfolioData from './portfolio.public.json'
import type { CapabilityRecord, KnowledgeClient, PortfolioKnowledge, ProfileRecord } from './types'

const data = portfolioData as unknown as PortfolioKnowledge

/**
 * Alpha implementation of KnowledgeClient per ADR-005: reads the build-time
 * static artifact. No network request, no Second Brain access. M6 replaces
 * this with an implementation backed by the real Portfolio Knowledge API
 * without changing any consumer of KnowledgeClient.
 */
export class StaticKnowledgeClient implements KnowledgeClient {
  async getProfile(): Promise<ProfileRecord | null> {
    return data.profile
  }

  async listCapabilities(): Promise<CapabilityRecord[]> {
    return data.capabilities
  }
}

export const knowledgeClient: KnowledgeClient = new StaticKnowledgeClient()
