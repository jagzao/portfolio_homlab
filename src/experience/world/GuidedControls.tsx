import { LANDMARKS } from './landmarks'

interface GuidedControlsProps {
  nextIndex: number
  onContinue: () => void
  onExitToFree: () => void
}

/**
 * Guided Mode's "Continue" control (US-010 Movement and Input Model):
 * visible button, click/tap/Space/right-arrow all advance (the keyboard
 * bindings live in Experience3D), and exiting to Free Exploration is
 * always one click away — Guided Mode never seizes navigation.
 */
export function GuidedControls({ nextIndex, onContinue, onExitToFree }: GuidedControlsProps) {
  const done = nextIndex >= LANDMARKS.length
  return (
    <div
      style={{
        position: 'absolute',
        top: 'var(--space-3)',
        right: 'var(--space-3)',
        background: 'rgba(11, 12, 14, 0.75)',
        border: '1px solid var(--color-glass-border)',
        borderRadius: '4px',
        padding: 'var(--space-2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
        alignItems: 'flex-end',
      }}
    >
      {!done && (
        <button type="button" onClick={onContinue}>
          Continue to {LANDMARKS[nextIndex].label}
        </button>
      )}
      {done && <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>End of guided route.</span>}
      <button type="button" onClick={onExitToFree} style={{ fontSize: '0.8rem' }}>
        Switch to Free Exploration
      </button>
    </div>
  )
}
