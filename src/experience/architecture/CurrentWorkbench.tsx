/**
 * Current Workbench v1 (MASTER_BACKLOG M5). Shows current experiments from
 * safe public data when available; per the backlog, when unavailable it uses
 * an explicit placeholder rather than inventing content. No verified
 * experiments exist yet (src/content/portfolio.public.json ships an empty
 * profile and no capability/experiment records — neutral absence, never
 * invented), so this renders a clearly-marked neutral empty state. Plain HTML,
 * works in the semantic shell and the 3D overlay.
 */
export function CurrentWorkbench({ idPrefix = 'lab' }: { idPrefix?: string }) {
  const headingId = `${idPrefix}-current-workbench-heading`
  return (
    <section aria-labelledby={headingId} style={{ marginBottom: 'var(--space-3)' }}>
      <h3 id={headingId} style={{ margin: '0 0 0.35rem', fontSize: '1rem', color: 'var(--color-text)' }}>
        Current Workbench v1
      </h3>
      <div
        style={{
          background: 'var(--color-structure)',
          border: '1px dashed var(--color-glass-border)',
          borderRadius: '4px',
          padding: '0.7rem',
          fontSize: '0.9rem',
          lineHeight: 1.5,
          color: 'var(--color-text-muted)',
        }}
      >
        Current workbench experiments will appear here once verified public content is published.
      </div>
    </section>
  )
}
