import { useArchitectureTable } from './ArchitectureTableContext'
import { EngineeringDecisions } from './EngineeringDecisions'
import { TechnologyWall } from './TechnologyWall'
import { CurrentWorkbench } from './CurrentWorkbench'

/**
 * Entry point for the Software Engineering Lab: the "Open Architecture Table"
 * trigger plus the Engineering Decisions / Technology Wall / Current Workbench
 * stations, usable identically from the semantic shell (always available, no
 * WebGL required) and from within the 3D experience near the Software
 * Engineering Lab landmark. Both mount points share one open flag
 * (ArchitectureTableProvider) and the panel itself renders exactly once,
 * globally (ArchitectureTableRoot) — an earlier version had each mount point
 * render its own ArchitecturePanel when open, which meant clicking either
 * trigger opened two simultaneous dialogs at once.
 *
 * The recruiter-target framing is honest: no verified professional content
 * exists yet, so the lab demonstrates engineering capability through the
 * interactive Architecture Table and the generic Engineering Decisions, while
 * the professional identity/stack details await verified content.
 *
 * `idPrefix` keeps the per-station heading and aria-controls IDs unique across
 * the two mount points (semantic shell + 3D overlay), which would otherwise
 * collide.
 */
export function SoftwareLabSection({ idPrefix }: { idPrefix?: string }) {
  const { setOpen } = useArchitectureTable()
  const prefix = idPrefix ?? 'lab'

  return (
    <div style={{ display: 'grid', gap: 'var(--space-3)', maxWidth: '42rem' }}>
      <p style={{ margin: 0, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
        The lab demonstrates engineering capability through inspectable systems and judgment: the interactive
        Architecture Table and generic Engineering Decisions below. A specific professional identity and core-stack
        classification will appear here once Juan&rsquo;s verified public content is published.
      </p>

      <div>
        <button type="button" onClick={() => setOpen(true)}>
          Open Architecture Table
        </button>
      </div>

      <EngineeringDecisions idPrefix={prefix} />
      <TechnologyWall idPrefix={prefix} />
      <CurrentWorkbench idPrefix={prefix} />
    </div>
  )
}
