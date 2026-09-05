/**
 * Public knowledge-client contract per docs/architecture/CONTENT_MODEL.md and
 * docs/adr/ADR-005-public-content-delivery-alpha.md. Alpha implements this
 * against a build-time static artifact (StaticKnowledgeClient); M6 implements
 * the same interface against a live Portfolio Knowledge API without changing
 * any presentation component.
 */

export type VerificationState = 'VERIFIED'
export type PublicationState = 'PUBLISHED'

export type TechnologyCategory = 'CORE' | 'PRODUCTION_EXPERIENCE' | 'ACTIVE_EXPLORATION'

interface PublicEnvelope<Display> {
  id: string
  revision: number
  verification: VerificationState
  publication: PublicationState
  publishedAt: string
  updatedAt: string
  display: Display
  evidence: EvidenceReference[]
}

export interface EvidenceReference {
  id: string
  kind: string
  label: string
  url?: string
}

export type ProfileRecord = PublicEnvelope<{
  displayName: string
  headline: string
  summary: string
}>

export type CapabilityRecord = PublicEnvelope<{
  label: string
  category: TechnologyCategory
}>

export interface PortfolioKnowledge {
  generatedAt: string
  profile: ProfileRecord | null
  capabilities: CapabilityRecord[]
}

export interface KnowledgeClient {
  getProfile(): Promise<ProfileRecord | null>
  listCapabilities(): Promise<CapabilityRecord[]>
}
