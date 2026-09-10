export type ComponentId = 'api' | 'queue' | 'worker' | 'cache' | 'database'

export interface ArchitectureComponent {
  id: ComponentId
  label: string
  /** Explains engineering meaning — MASTER_BACKLOG M5: "must explain engineering meaning, not merely animate boxes." */
  description: string
}

/** API -> QUEUE -> WORKER -> CACHE -> DATABASE. Cache included because it earns its place: it's what lets WORKER survive a slow/failing DATABASE during the failure sequence. */
export const ARCHITECTURE_COMPONENTS: ArchitectureComponent[] = [
  { id: 'api', label: 'API', description: 'Accepts requests and enqueues work instead of blocking on it.' },
  { id: 'queue', label: 'QUEUE', description: 'Buffers work so a slow downstream component backs up instead of failing requests immediately.' },
  { id: 'worker', label: 'WORKER', description: 'Processes queued work, calling CACHE before DATABASE.' },
  { id: 'cache', label: 'CACHE', description: 'Serves recent results without hitting DATABASE — including stale-but-available data while DATABASE is degraded.' },
  { id: 'database', label: 'DATABASE', description: 'The system of record. Slowest and most expensive component to call directly.' },
]

export const ARCHITECTURE_EDGES: Array<[ComponentId, ComponentId]> = [
  ['api', 'queue'],
  ['queue', 'worker'],
  ['worker', 'cache'],
  ['cache', 'database'],
]
