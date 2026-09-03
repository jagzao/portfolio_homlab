import { useArchitectureTable } from './ArchitectureTableContext'

/**
 * Entry point for the Architecture Table: just the trigger button, usable
 * identically from the semantic shell (always available, no WebGL
 * required) and from within the 3D experience near the Software
 * Engineering Lab landmark. Both mount points share one open flag
 * (ArchitectureTableProvider) and the panel itself renders exactly once,
 * globally (ArchitectureTableRoot) — an earlier version had each mount
 * point render its own ArchitecturePanel when open, which meant clicking
 * either trigger opened two simultaneous dialogs at once.
 */
export function SoftwareLabSection() {
  const { setOpen } = useArchitectureTable()

  return (
    <button type="button" onClick={() => setOpen(true)}>
      Open Architecture Table
    </button>
  )
}
