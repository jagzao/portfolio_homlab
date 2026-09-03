interface DayNightToggleProps {
  isDay: boolean
  onToggle: () => void
}

/**
 * Manual day/night control (MASTER_BACKLOG M7: "manual mode is acceptable,
 * real-time clock is optional and not a release requirement").
 */
export function DayNightToggle({ isDay, onToggle }: DayNightToggleProps) {
  return (
    <div style={{ position: 'absolute', top: 'var(--space-3)', left: 'var(--space-3)' }}>
      <button type="button" onClick={onToggle}>
        {isDay ? 'Switch to night' : 'Switch to day'}
      </button>
    </div>
  )
}
