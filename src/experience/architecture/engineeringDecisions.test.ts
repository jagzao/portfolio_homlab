import { describe, expect, it } from 'vitest'
import { ENGINEERING_DECISIONS } from './engineeringDecisions.data'

describe('ENGINEERING_DECISIONS', () => {
  it('provides at least one inspectable generic trade-off (M5 Engineering Decisions v1)', () => {
    expect(ENGINEERING_DECISIONS.length).toBeGreaterThanOrEqual(1)
  })

  it('ships 2-3 generic scenarios', () => {
    expect(ENGINEERING_DECISIONS.length).toBeGreaterThanOrEqual(2)
    expect(ENGINEERING_DECISIONS.length).toBeLessThanOrEqual(3)
  })

  it('each decision has a question, options, reasoning, and guidance', () => {
    for (const decision of ENGINEERING_DECISIONS) {
      expect(decision.question.trim().length).toBeGreaterThan(0)
      expect(decision.options.length).toBeGreaterThanOrEqual(2)
      for (const option of decision.options) {
        expect(option.label.trim().length).toBeGreaterThan(0)
        expect(option.summary.trim().length).toBeGreaterThan(0)
      }
      expect(decision.reasoning.trim().length).toBeGreaterThan(0)
      expect(decision.guidance.trim().length).toBeGreaterThan(0)
    }
  })

  it('has unique ids (used as aria-controls targets)', () => {
    const ids = ENGINEERING_DECISIONS.map((d) => d.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('never asserts a professional experience claim (AGENTS.md §17)', () => {
    const text = JSON.stringify(ENGINEERING_DECISIONS)
    expect(text).not.toMatch(/i (built|designed|ran|shipped|managed)/i)
    expect(text).not.toMatch(/\b(company|employer|job|role|years)\b/i)
  })
})
