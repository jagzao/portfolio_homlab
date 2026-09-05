import { useState } from 'react'
import { ENGINEERING_DECISIONS, type EngineeringDecision } from './engineeringDecisions.data'

/**
 * Engineering Decisions v1 (MASTER_BACKLOG M5). Renders 2-3 inspectable
 * GENERIC engineering trade-offs — the audit explicitly allows a generic
 * scenario since it is not blocked by Second Brain data. Each decision is an
 * expandable detail element: the question, the options, the trade-off
 * reasoning, and a "when to choose which" note. Plain HTML, keyboard- and
 * screen-reader-reachable, works identically in the semantic shell and the
 * 3D overlay.
 */
export function EngineeringDecisions({ idPrefix = 'lab' }: { idPrefix?: string }) {
  const [openId, setOpenId] = useState<string | null>(ENGINEERING_DECISIONS[0].id)
  const headingId = `${idPrefix}-engineering-decisions-heading`

  return (
    <section aria-labelledby={headingId} style={{ marginBottom: 'var(--space-3)' }}>
      <h3 id={headingId} style={{ margin: '0 0 0.35rem', fontSize: '1rem', color: 'var(--color-text)' }}>
        Engineering Decisions v1
      </h3>
      <p style={{ margin: '0 0 var(--space-2)', color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
        Generic engineering trade-offs — labeled scenarios for illustration, not claims about prior professional work.
        Select a decision to expand it.
      </p>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.5rem' }}>
        {ENGINEERING_DECISIONS.map((decision) => (
          <DecisionCard
            key={decision.id}
            decision={decision}
            idPrefix={idPrefix}
            open={openId === decision.id}
            onToggle={() => setOpenId(openId === decision.id ? null : decision.id)}
          />
        ))}
      </ul>
    </section>
  )
}

function DecisionCard({ decision, idPrefix, open, onToggle }: { decision: EngineeringDecision; idPrefix: string; open: boolean; onToggle: () => void }) {
  const detailId = `${idPrefix}-decision-detail-${decision.id}`
  return (
    <li>
      <div style={{ background: 'var(--color-structure)', border: `1px solid ${open ? 'var(--color-gold)' : 'var(--color-glass-border)'}`, borderRadius: '4px' }}>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={open ? detailId : undefined}
          onClick={onToggle}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text)',
            padding: '0.6rem 0.7rem',
            cursor: 'pointer',
            textAlign: 'left',
            fontWeight: 600,
          }}
        >
          <span>{decision.question}</span>
          <span aria-hidden="true" style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
            {open ? '−' : '+'}
          </span>
        </button>
        {open && (
          <div id={detailId} style={{ borderTop: '1px solid var(--color-glass-border)', padding: '0.7rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
            <p style={{ margin: '0 0 0.5rem' }}>
              <strong>Options:</strong>
            </p>
            <ul style={{ margin: '0 0 0.5rem', paddingLeft: '1.2rem' }}>
              {decision.options.map((option) => (
                <li key={option.label} style={{ marginBottom: '0.25rem' }}>
                  <strong>{option.label}:</strong> {option.summary}
                </li>
              ))}
            </ul>
            <p style={{ margin: '0 0 0.5rem' }}>
              <strong>Trade-off:</strong> {decision.reasoning}
            </p>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
              <strong>When to choose which:</strong> {decision.guidance}
            </p>
          </div>
        )}
      </div>
    </li>
  )
}
