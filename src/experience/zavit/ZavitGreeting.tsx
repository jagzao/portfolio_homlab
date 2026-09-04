import { useEffect, useRef } from 'react'

interface ZavitGreetingProps {
  onChoose: (mode: 'guided' | 'free') => void
}

/**
 * Zavit's greeting: brief, skippable, offers Guided/Free per
 * docs/vision/USER_JOURNEY.md step 4. Never traps the visitor — both
 * choices and Skip all just dismiss it. Moves focus in on open and back to
 * where it came from on dismiss (WCAG 2.4.3/4.1.2), without a keyboard trap.
 */
export function ZavitGreeting({ onChoose }: ZavitGreetingProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const firstButtonRef = useRef<HTMLButtonElement>(null)
  const previouslyFocused = useRef<Element | null>(null)

  useEffect(() => {
    previouslyFocused.current = document.activeElement
    firstButtonRef.current?.focus()
    return () => {
      if (previouslyFocused.current instanceof HTMLElement) previouslyFocused.current.focus()
    }
  }, [])

  // Modal dialog per WAI-ARIA APG, same pattern as ArchitecturePanel: Escape
  // dismisses (equivalent to Skip - never traps the visitor), Tab/Shift+Tab
  // stays inside rather than escaping into background content.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onChoose('free')
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
  }, [onChoose])

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Zavit"
      style={{
        position: 'absolute',
        top: 'var(--space-3)',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--color-structure-raised)',
        border: '1px solid var(--color-glass-border)',
        borderRadius: '4px',
        padding: 'var(--space-2)',
        maxWidth: '24rem',
        textAlign: 'center',
      }}
    >
      <p style={{ margin: '0 0 var(--space-2)' }}>
        Hi, I&rsquo;m Zavit. Want a guided tour, or would you rather explore on your own?
      </p>
      <div style={{ display: 'flex', gap: 'var(--space-1)', justifyContent: 'center' }}>
        <button ref={firstButtonRef} type="button" onClick={() => onChoose('guided')}>
          Guided Mode
        </button>
        <button type="button" onClick={() => onChoose('free')}>
          Free Exploration
        </button>
        <button type="button" onClick={() => onChoose('free')}>
          Skip
        </button>
      </div>
    </div>
  )
}
