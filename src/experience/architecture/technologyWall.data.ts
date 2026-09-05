import type { CapabilityRecord, TechnologyCategory } from '../../content/types'

export const TECHNOLOGY_CATEGORIES: TechnologyCategory[] = ['CORE', 'PRODUCTION_EXPERIENCE', 'ACTIVE_EXPLORATION']

/**
 * Whether the Technology Wall should render its neutral empty state.
 *
 * The wall only lists real classifications when verified public content is
 * available. `portfolio.public.json` currently ships `capabilities: []`
 * (neutral absence, never invented content), so the honest UI is an empty
 * state that explains classifications are pending, without fabricating any
 * professional claim (AGENTS.md §17).
 */
export function hasVerifiedCapabilities(capabilities: CapabilityRecord[]): boolean {
  return capabilities.length > 0
}
