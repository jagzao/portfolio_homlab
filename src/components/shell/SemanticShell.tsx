import type { ReactNode } from 'react'

interface SemanticShellProps {
  children: ReactNode
}

/**
 * The application shell: identifies Juan and HomeLab and stays fully usable
 * without WebGL, per docs/architecture/TECHNICAL_ARCHITECTURE.md's
 * "semantic portfolio" experience layer. Never a blank loading screen.
 */
export function SemanticShell({ children }: SemanticShellProps) {
  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--space-2) var(--space-3)',
          borderBottom: '1px solid var(--color-glass-border)',
        }}
      >
        <span style={{ fontWeight: 600, letterSpacing: '0.04em' }}>HomeLab</span>
        <nav aria-label="Primary">
          <a
            href="https://github.com/jagzao"
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}
          >
            Contact
          </a>
        </nav>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <section style={{ padding: 'var(--space-4) var(--space-3)', maxWidth: '48rem' }}>
          <h1 style={{ fontSize: '2rem', margin: 0, color: 'var(--color-text)' }}>
            Juan&rsquo;s HomeLab
          </h1>
          <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            HomeLab is a living personal research laboratory that also functions as a professional
            portfolio. Explore it in 3D, or stay here in the accessible, fully semantic version —
            every essential piece of content works either way.
          </p>
        </section>

        {children}
      </main>

      <footer
        style={{
          padding: 'var(--space-2) var(--space-3)',
          color: 'var(--color-text-muted)',
          fontSize: '0.85rem',
          borderTop: '1px solid var(--color-glass-border)',
        }}
      >
        HomeLab &mdash; a living lab, not a rendered CV.
      </footer>
    </div>
  )
}
