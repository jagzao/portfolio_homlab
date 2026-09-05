import type { ComponentId } from './topology'

export type ComponentStatus = 'normal' | 'degraded' | 'recovering'

export interface SimulationFrame {
  /** Seconds after SIMULATE FAILURE is triggered that this frame becomes active. */
  atSeconds: number
  statuses: Partial<Record<ComponentId, ComponentStatus>>
  queueDepth: number
  latencyMs: number
  errorRatePct: number
  circuitBreaker: 'closed' | 'open'
  /** The engineering narration for this frame — not just a state, an explanation. */
  note: string
}

/**
 * All values here are `SIMULATION` per docs/product/SOFTWARE_ENGINEERING_LAB.md
 * and MASTER_BACKLOG.md M5 — never presented as production evidence. A fixed,
 * pure timeline (not live-randomized) so the sequence is deterministic and
 * testable.
 */
export const SIMULATION_FRAMES: SimulationFrame[] = [
  {
    atSeconds: 0,
    statuses: { api: 'normal', queue: 'normal', worker: 'normal', cache: 'normal', database: 'normal' },
    queueDepth: 3,
    latencyMs: 45,
    errorRatePct: 0,
    circuitBreaker: 'closed',
    note: 'Baseline: all components healthy.',
  },
  {
    atSeconds: 2,
    statuses: { database: 'degraded' },
    queueDepth: 3,
    latencyMs: 320,
    errorRatePct: 2,
    circuitBreaker: 'closed',
    note: 'DATABASE is failing to respond in time. WORKER calls are slowing down.',
  },
  {
    atSeconds: 4,
    statuses: { database: 'degraded', worker: 'degraded', queue: 'degraded' },
    queueDepth: 18,
    latencyMs: 890,
    errorRatePct: 11,
    circuitBreaker: 'closed',
    note: 'QUEUE is backing up: WORKER can’t drain it as fast as API enqueues work. WORKER is retrying its DATABASE calls, which is adding load to an already-struggling DATABASE instead of failing fast.',
  },
  {
    atSeconds: 6,
    statuses: { database: 'degraded', worker: 'degraded', queue: 'degraded' },
    queueDepth: 26,
    latencyMs: 1450,
    errorRatePct: 24,
    circuitBreaker: 'open',
    note: 'Queue depth and latency peak here — then the circuit breaker opens: WORKER stops calling DATABASE directly and serves from CACHE only. This is the turning point, not instant relief: it trades freshness for availability and stops the failure from spreading further, with recovery visible over the next few seconds.',
  },
  {
    atSeconds: 8,
    statuses: { database: 'recovering', worker: 'degraded' },
    queueDepth: 14,
    latencyMs: 210,
    errorRatePct: 6,
    circuitBreaker: 'open',
    note: 'DATABASE is recovering. Circuit breaker stays open a little longer to confirm stability before resuming direct calls.',
  },
  {
    atSeconds: 10,
    statuses: { api: 'normal', queue: 'normal', worker: 'normal', cache: 'normal', database: 'normal' },
    queueDepth: 3,
    latencyMs: 48,
    errorRatePct: 0,
    circuitBreaker: 'closed',
    note: 'Circuit breaker closes. QUEUE has drained. Recovered in 10s (simulated).',
  },
]

export const SIMULATION_DURATION_SECONDS = SIMULATION_FRAMES[SIMULATION_FRAMES.length - 1].atSeconds

/** Pure lookup: which frame is active at a given elapsed time. Testable without real timers. */
export function frameAt(elapsedSeconds: number): SimulationFrame {
  let active = SIMULATION_FRAMES[0]
  for (const frame of SIMULATION_FRAMES) {
    if (frame.atSeconds <= elapsedSeconds) active = frame
  }
  return active
}
