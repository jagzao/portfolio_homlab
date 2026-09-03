import { LANDMARKS } from '../../experience/world/landmarks'

/**
 * Semantic equivalent of the 3D journey (docs/vision/USER_JOURNEY.md
 * Recovery and alternate paths): always rendered, independent of WebGL or
 * the "Enter HomeLab" action, so the journey's content reaches a visitor
 * who never loads (or never wants) the 3D experience.
 */
export function JourneyList() {
  return (
    <section aria-labelledby="journey-heading" style={{ padding: '0 var(--space-3) var(--space-3)' }}>
      <h2 id="journey-heading" style={{ fontSize: '1.1rem', color: 'var(--color-text)' }}>
        The Journey
      </h2>
      <ol style={{ color: 'var(--color-text-muted)', lineHeight: 1.6, paddingLeft: '1.25rem' }}>
        {LANDMARKS.map((landmark) => (
          <li key={landmark.id}>
            <strong style={{ color: 'var(--color-text)' }}>{landmark.label}.</strong> {landmark.description}
          </li>
        ))}
      </ol>
    </section>
  )
}
