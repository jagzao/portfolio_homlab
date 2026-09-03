import { lazy, Suspense, useState } from 'react'
import { detectCapability, type ExperienceTier } from '../../capability/detectCapability'
import { useReducedMotion } from '../../capability/useReducedMotion'
import { LoadingState } from '../shell/LoadingState'
import { ExperienceNotice } from '../shell/ExperienceNotice'
import { CanvasErrorBoundary } from './CanvasErrorBoundary'

const Experience3D = lazy(() => import('./Experience3D'))

type BoundaryState =
  // `tier` is captured for M3, which will use 'adapted' to scale quality
  // (ADR-002); M2's graybox has nothing to scale yet, so it's not consumed.
  | { kind: 'idle' }
  | { kind: 'active'; tier: ExperienceTier }
  | { kind: 'notice'; message: string; canOptIntoFull: boolean }
  | { kind: 'runtime-error' }

const NOTICE_COPY: Record<string, string> = {
  'webgl-unavailable': '3D unavailable in this browser — showing full content.',
  'data-saver': 'Data saver is on, so we kept this in full-content mode.',
}

/**
 * Loads the 3D runtime only after a capability check and explicit visitor
 * intent (the "Enter HomeLab" action), per
 * docs/architecture/TECHNICAL_ARCHITECTURE.md Capability and Loading
 * Boundaries. Never blocks or replaces the semantic shell.
 */
export function ExperienceBoundary() {
  const [state, setState] = useState<BoundaryState>({ kind: 'idle' })
  // Live, not the one-shot entry-time check: if the OS preference changes
  // while the 3D experience is already active, the running scene reacts.
  const reducedMotion = useReducedMotion()

  function evaluateAndEnter(forceFull = false) {
    const result = detectCapability()
    const tier = forceFull ? 'full' : result.tier

    if (tier === 'semantic') {
      setState({
        kind: 'notice',
        message: NOTICE_COPY[result.reason] ?? '3D unavailable — showing full content.',
        canOptIntoFull: result.canOptIntoFull,
      })
      return
    }

    setState({ kind: 'active', tier })
  }

  if (state.kind === 'idle') {
    return (
      <div style={{ padding: '0 var(--space-3) var(--space-3)' }}>
        <button type="button" onClick={() => evaluateAndEnter()}>
          Enter HomeLab
        </button>
      </div>
    )
  }

  if (state.kind === 'notice') {
    return (
      <ExperienceNotice
        message={state.message}
        onRetry={state.canOptIntoFull ? () => evaluateAndEnter(true) : undefined}
        onDismiss={() => setState({ kind: 'idle' })}
      />
    )
  }

  if (state.kind === 'runtime-error') {
    return (
      <ExperienceNotice
        message="The 3D experience failed to load — showing full content instead."
        onRetry={() => evaluateAndEnter()}
        onDismiss={() => setState({ kind: 'idle' })}
      />
    )
  }

  return (
    <CanvasErrorBoundary onError={() => setState({ kind: 'runtime-error' })}>
      <Suspense fallback={<LoadingState />}>
        <Experience3D reducedMotion={reducedMotion} />
      </Suspense>
    </CanvasErrorBoundary>
  )
}
