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
  // The greeting is mounted conditionally by Experience3D; to ensure its
  // Escape truly wins over the parent window listener we add the handler in
  // the capture phase and call stopImmediatePropagation + preventDefault.
  // stopImmediatePropagation prevents any other window listener (specifically
  // Experience3D's bubble-phase Escape handler) from running on this event at
  // all, not just from the same node. preventDefault avoids the browser's own
  // default fullscreen/escape behaviors.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopImmediatePropagation()
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
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [onChoose])

  // When the greeting is removed from the tree, React's cleanup function
  // runs and restores focus to `previouslyFocused.current`. However, if a
  // capture-phase parent listener (Experience3D) runs its own cleanup logic
  // later in the same event dispatch, the restored focus can be stolen back.
  // We stopImmediatePropagation in the capture handler above, but as a second
  // line of defense we also disable the parent Escape listener for the brief
  // moment the greeting is being dismissed by setting a window-level flag
  // that Experience3D checks.
  useEffect(() => {
    const key = '__homelab_greeting_dismissal_in_progress__'
    ;(window as unknown as Record<string, unknown>)[key] = false
    return () => {
      ;(window as unknown as Record<string, unknown>)[key] = true
      setTimeout(() => {
        ;(window as unknown as Record<string, unknown>)[key] = false
      }, 0)
    }
  }, [])

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Zavit"
      style={{
        position: 'absolute',
        zIndex: 20,
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
