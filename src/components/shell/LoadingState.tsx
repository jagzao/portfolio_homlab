export function LoadingState() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        padding: 'var(--space-3)',
        color: 'var(--color-text-muted)',
      }}
    >
      Loading the 3D experience&hellip;
    </div>
  )
}
