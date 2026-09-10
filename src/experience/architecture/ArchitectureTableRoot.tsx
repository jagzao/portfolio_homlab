import { ArchitecturePanel } from './ArchitecturePanel'
import { useArchitectureTable } from './ArchitectureTableContext'

/**
 * Renders the Architecture Table exactly once, as a real fixed-position
 * modal overlay with a backdrop — regardless of which trigger (semantic
 * shell or 3D overlay) opened it. Mount once, near the top of the app.
 */
export function ArchitectureTableRoot() {
  const { open, setOpen } = useArchitectureTable()

  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-3)',
        background: 'rgba(11, 12, 14, 0.7)',
      }}
    >
      <div style={{ maxHeight: '100%', overflowY: 'auto' }}>
        <ArchitecturePanel onClose={() => setOpen(false)} />
      </div>
    </div>
  )
}
