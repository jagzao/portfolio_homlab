import { LANDMARKS } from './landmarks'
import type { Point2D } from './navigation'

interface LandmarkHudProps {
  currentId: string
  onSelect: (point: Point2D) => void
}

/**
 * Keyboard-reachable landmark list overlaying the 3D canvas: real HTML
 * buttons (native Tab order, no custom roving-focus machinery needed),
 * doubling as the orientation readout ("you are here"). This is an
 * accessibility/orientation aid, not the lore-breaking internal teleport
 * AGENTS.md prohibits — it jumps the *camera viewpoint*, the world stays
 * one continuous place.
 */
export function LandmarkHud({ currentId, onSelect }: LandmarkHudProps) {
  return (
    <nav
      aria-label="HomeLab landmarks"
      style={{
        position: 'absolute',
        bottom: 'var(--space-3)',
        left: 'var(--space-3)',
        maxHeight: 'calc(100% - 2 * var(--space-3))',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        background: 'rgba(11, 12, 14, 0.75)',
        border: '1px solid var(--color-glass-border)',
        borderRadius: '4px',
        padding: 'var(--space-1)',
      }}
    >
      {LANDMARKS.map((landmark) => {
        const isCurrent = landmark.id === currentId
        return (
          <button
            key={landmark.id}
            type="button"
            aria-current={isCurrent ? 'location' : undefined}
            onClick={() => onSelect({ x: landmark.position[0], z: landmark.position[2] })}
            style={{
              textAlign: 'left',
              background: isCurrent ? 'var(--color-structure-raised)' : 'transparent',
              border: 'none',
              borderLeft: isCurrent ? '2px solid var(--color-gold)' : '2px solid transparent',
              color: isCurrent ? 'var(--color-gold)' : 'var(--color-text-muted)',
              padding: '0.25rem 0.5rem',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            {landmark.label}
          </button>
        )
      })}
    </nav>
  )
}
