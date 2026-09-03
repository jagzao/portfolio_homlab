import { useEffect, useRef, useState } from 'react'
import { ARCHITECTURE_COMPONENTS, type ComponentId } from './topology'
import { SIMULATION_FRAMES, frameAt, type SimulationFrame } from './simulation'

const STATUS_COLOR: Record<string, string> = {
  normal: 'var(--color-green)',
  degraded: 'var(--color-red)',
  recovering: 'var(--color-gold)',
}

const STATUS_LABEL: Record<string, string> = {
  normal: 'normal',
  degraded: 'degraded',
  recovering: 'recovering',
}

interface ArchitecturePanelProps {
  onClose: () => void
}

/**
 * Architecture Table v1 (MASTER_BACKLOG M5): API -> QUEUE -> WORKER -> CACHE
 * -> DATABASE, inspectable, with a SIMULATE FAILURE run. Plain HTML/DOM, not
 * a WebGL scene object — this is what makes it the semantic equivalent too:
 * the same component works with or without the 3D canvas.
 */
export function ArchitecturePanel({ onClose }: ArchitecturePanelProps) {
  const [selected, setSelected] = useState<ComponentId | null>(null)
  const [elapsed, setElapsed] = useState<number | null>(null) // null = not running
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previouslyFocused = useRef<Element | null>(null)

  useEffect(() => {
    previouslyFocused.current = document.activeElement
    closeButtonRef.current?.focus()
    return () => {
      if (previouslyFocused.current instanceof HTMLElement) previouslyFocused.current.focus()
    }
  }, [])

  // Modal dialog per WAI-ARIA APG: Escape closes it, Tab/Shift+Tab stays
  // inside it rather than escaping into background content (the hidden
  // trigger button, header nav, etc).
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  useEffect(() => {
    if (elapsed === null) return
    if (elapsed >= SIMULATION_FRAMES[SIMULATION_FRAMES.length - 1].atSeconds) return
    const timer = setTimeout(() => setElapsed((e) => (e ?? 0) + 1), 1000)
    return () => clearTimeout(timer)
  }, [elapsed])

  const frame: SimulationFrame = elapsed === null ? SIMULATION_FRAMES[0] : frameAt(elapsed)
  const running = elapsed !== null && elapsed < SIMULATION_FRAMES[SIMULATION_FRAMES.length - 1].atSeconds
  const selectedComponent = ARCHITECTURE_COMPONENTS.find((c) => c.id === selected)

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Architecture Table"
      style={{
        background: 'var(--color-structure-raised)',
        border: '1px solid var(--color-glass-border)',
        borderRadius: '4px',
        padding: 'var(--space-3)',
        maxWidth: '40rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
        <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Architecture Table</h2>
        <button ref={closeButtonRef} type="button" onClick={onClose}>
          Close
        </button>
      </div>

      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
        A distributed request pipeline. Select a component to see what it does, or run a labeled <strong>SIMULATION</strong> of
        a downstream failure and recovery.
      </p>

      <div
        role="list"
        aria-label="Architecture components, in request-flow order"
        style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.3rem', margin: 'var(--space-2) 0' }}
      >
        {ARCHITECTURE_COMPONENTS.map((component, index) => {
          const status = frame.statuses[component.id] ?? 'normal'
          const isSelected = selected === component.id
          return (
            <span key={component.id} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              {index > 0 && (
                <span aria-hidden="true" style={{ color: 'var(--color-text-muted)' }}>
                  →
                </span>
              )}
              <button
                type="button"
                role="listitem"
                aria-expanded={isSelected}
                aria-controls={isSelected ? 'architecture-component-detail' : undefined}
                onClick={() => setSelected((s) => (s === component.id ? null : component.id))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  border: `1px solid ${isSelected ? 'var(--color-gold)' : 'var(--color-glass-border)'}`,
                  background: 'var(--color-structure)',
                  borderRadius: '4px',
                  padding: '0.4rem 0.6rem',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{ width: '0.6rem', height: '0.6rem', borderRadius: '50%', background: STATUS_COLOR[status], display: 'inline-block' }}
                />
                {component.label}
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>({STATUS_LABEL[status]})</span>
              </button>
            </span>
          )
        })}
      </div>

      {selectedComponent && (
        <p id="architecture-component-detail" style={{ background: 'var(--color-structure)', padding: 'var(--space-1)', borderRadius: '4px' }}>
          <strong>{selectedComponent.label}:</strong> {selectedComponent.description}
        </p>
      )}

      <div style={{ marginTop: 'var(--space-2)' }}>
        <button type="button" disabled={running} onClick={() => setElapsed(0)}>
          {running ? 'Simulation running…' : elapsed === null ? 'SIMULATE FAILURE' : 'Run again'}
        </button>
      </div>

      <div role="status" aria-live="polite" style={{ marginTop: 'var(--space-2)', fontSize: '0.85rem' }}>
        {elapsed !== null && (
          <>
            <p style={{ margin: '0 0 0.25rem', color: 'var(--color-gold)', fontWeight: 600 }}>SIMULATION — {frame.note}</p>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
              SIMULATION metrics — queue depth: {frame.queueDepth} · latency: {frame.latencyMs}ms · error rate:{' '}
              {frame.errorRatePct}% · circuit breaker: {frame.circuitBreaker}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
