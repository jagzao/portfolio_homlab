/**
 * Entry-time capability detection per docs/adr/ADR-002-degraded-mode-strategy.md.
 * Evaluated once on load (never polled). Any signal the browser doesn't expose
 * is treated as "unknown, do not restrict" so detection degrades toward
 * permissiveness, never toward silently blocking content.
 */

export type ExperienceTier = 'full' | 'adapted' | 'semantic'

export interface CapabilityResult {
  tier: ExperienceTier
  reason: string
  reducedMotion: boolean
  /** True only when semantic mode was chosen for a recoverable reason (data saver). */
  canOptIntoFull: boolean
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

function isDataSaverOrSlowNetwork(): boolean {
  const connection = (navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string }
  }).connection
  if (!connection) return false
  if (connection.saveData) return true
  if (connection.effectiveType && ['slow-2g', '2g', '3g'].includes(connection.effectiveType)) {
    return true
  }
  return false
}

function isCoarsePointerSmallViewport(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  try {
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches
    return coarsePointer && window.innerWidth < 768
  } catch {
    return false
  }
}

function isLowCapabilityDevice(): boolean {
  const nav = navigator as Navigator & { deviceMemory?: number }
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory < 4) return true
  if (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4) {
    return true
  }
  return false
}

export function detectCapability(): CapabilityResult {
  const reducedMotion = prefersReducedMotion()

  if (!hasWebGL()) {
    return { tier: 'semantic', reason: 'webgl-unavailable', reducedMotion, canOptIntoFull: false }
  }

  if (isDataSaverOrSlowNetwork()) {
    return { tier: 'semantic', reason: 'data-saver', reducedMotion, canOptIntoFull: true }
  }

  if (isCoarsePointerSmallViewport()) {
    return { tier: 'adapted', reason: 'mobile-heuristic', reducedMotion, canOptIntoFull: false }
  }

  if (isLowCapabilityDevice()) {
    return { tier: 'adapted', reason: 'low-capability-device', reducedMotion, canOptIntoFull: false }
  }

  return { tier: 'full', reason: 'default', reducedMotion, canOptIntoFull: false }
}
