import { ArchitecturePanel } from './ArchitecturePanel'
import { useArchitectureTable } from './ArchitectureTableContext'

/**
 * Entry point for the Architecture Table, usable identically from the
 * semantic shell (always available, no WebGL required) and from within the
 * 3D experience near the Software Engineering Lab landmark — same
 * component, shared open state (ArchitectureTableProvider), so the two
 * mount points can never show two simultaneous dialogs.
 *
 * The trigger button stays mounted (hidden via CSS, not removed) while the
 * panel is open, so ArchitecturePanel's own focus-restore-on-close can
 * still find it — a conditional-unmount version left the captured
 * `document.activeElement` pointing at a DOM node already removed from the
 * page, silently failing to restore focus.
 */
export function SoftwareLabSection() {
  const { open, setOpen } = useArchitectureTable()

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={open ? { display: 'none' } : undefined}
      >
        Open Architecture Table
      </button>
      {open && <ArchitecturePanel onClose={() => setOpen(false)} />}
    </>
  )
}
