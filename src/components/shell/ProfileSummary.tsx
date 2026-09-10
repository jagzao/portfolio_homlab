import { useEffect, useState } from 'react'
import { knowledgeClient } from '../../content/client'
import type { ProfileRecord } from '../../content/types'

/**
 * Renders a VERIFIED+PUBLISHED profile headline through the ADR-005 static
 * knowledge client. No record exists yet in src/content/portfolio.public.json,
 * so this currently renders nothing — per CONTENT_MODEL.md, a missing record
 * is neutral absence, never generated filler. Proves the public content
 * adapter interface end to end so M5/M6 can populate it without touching
 * this component.
 */
export function ProfileSummary() {
  const [profile, setProfile] = useState<ProfileRecord | null>(null)

  useEffect(() => {
    let cancelled = false
    knowledgeClient.getProfile().then((result) => {
      if (!cancelled) setProfile(result)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!profile) return null

  return (
    <p style={{ color: 'var(--color-gold)', fontWeight: 600 }}>{profile.display.headline}</p>
  )
}
