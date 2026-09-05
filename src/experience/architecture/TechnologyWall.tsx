import { useEffect, useState } from 'react'
import { knowledgeClient } from '../../content/client'
import type { CapabilityRecord } from '../../content/types'
import { hasVerifiedCapabilities, TECHNOLOGY_CATEGORIES } from './technologyWall.data'

/**
 * Technology Wall v1 (MASTER_BACKLOG M5). Shows the three accepted
 * classification buckets (CORE / PRODUCTION_EXPERIENCE / ACTIVE_EXPLORATION)
 * without logo soup and without implying equal expertise.
 *
 * No verified capabilities exist yet (src/content/portfolio.public.json ships
 * `capabilities: []` — neutral absence, never invented content), so the honest
 * UI is a clearly-labeled empty state: the three buckets render with an
 * explanation that verified classifications will appear once Juan's verified
 * public content is published. It never fabricates which technologies count as
 * production experience (AGENTS.md §17). Plain HTML, works in the semantic
 * shell and the 3D overlay.
 */
export function TechnologyWall({ idPrefix = 'lab' }: { idPrefix?: string }) {
  const [capabilities, setCapabilities] = useState<CapabilityRecord[] | null>(null)
  const headingId = `${idPrefix}-technology-wall-heading`

  useEffect(() => {
    let cancelled = false
    knowledgeClient.listCapabilities().then((result) => {
      if (!cancelled) setCapabilities(result)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const hasCapabilities = hasVerifiedCapabilities(capabilities ?? [])

  return (
    <section aria-labelledby={headingId} style={{ marginBottom: 'var(--space-3)' }}>
      <h3 id={headingId} style={{ margin: '0 0 0.35rem', fontSize: '1rem', color: 'var(--color-text)' }}>
        Technology Wall v1
      </h3>
      <p style={{ margin: '0 0 var(--space-2)', color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
        Technology classification without logo soup — and without implying equal expertise.
      </p>

      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.5rem' }}>
        {TECHNOLOGY_CATEGORIES.map((category) => (
          <li
            key={category}
            style={{ background: 'var(--color-structure)', border: '1px solid var(--color-glass-border)', borderRadius: '4px', padding: '0.6rem 0.7rem' }}
          >
            <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{category.replace(/_/g, ' ')}</div>
            {hasCapabilities ? (
              <div style={{ marginTop: '0.2rem', color: 'var(--color-text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                {category === 'CORE'
                  ? 'Core direction and primary daily stack.'
                  : category === 'PRODUCTION_EXPERIENCE'
                    ? 'Technologies with verified production evidence.'
                    : 'Current growth and exploration areas.'}
              </div>
            ) : (
              <div style={{ marginTop: '0.2rem', color: 'var(--color-text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Pending verified content — classifications will appear here once Juan&rsquo;s verified public content is published.
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
