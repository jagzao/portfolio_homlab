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
  const firstButtonRef = useRef<HTMLButtonElement>(null)
  const previouslyFocused = useRef<Element | null>(null)

  useEffect(() => {
    previouslyFocused.current = document.activeElement
    firstButtonRef.current?.focus()
    return () => {
      if (previouslyFocused.current instanceof HTMLElement) previouslyFocused.current.focus()
    }
  }, [])

  return (
    <div
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
