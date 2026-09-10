interface ExperienceNoticeProps {
  message: string
  onRetry?: () => void
  onDismiss: () => void
}

/**
 * Visible, dismissible notice shown whenever the 3D experience is
 * unavailable, degraded, or failed at runtime — per ADR-002, this never
 * blocks semantic content and never appears as a silent blank screen.
 */
export function ExperienceNotice({ message, onRetry, onDismiss }: ExperienceNoticeProps) {
  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: 'var(--space-2) var(--space-3)',
        margin: 'var(--space-2) var(--space-3)',
        background: 'var(--color-structure-raised)',
        border: '1px solid var(--color-glass-border)',
        borderLeft: '3px solid var(--color-gold)',
        borderRadius: '4px',
      }}
    >
      <span style={{ flex: 1 }}>{message}</span>
      {onRetry && (
        <button type="button" onClick={onRetry}>
          Try 3D
        </button>
      )}
      <button type="button" onClick={onDismiss} aria-label="Dismiss notice">
        Dismiss
      </button>
    </div>
  )
}
