export interface EngineeringDecisionOption {
  label: string
  summary: string
}

export interface EngineeringDecision {
  id: string
  question: string
  options: EngineeringDecisionOption[]
  reasoning: string
  /** "when to choose which" note — the practical guidance a recruiter can scan. */
  guidance: string
}

/**
 * Generic engineering trade-offs for the Engineering Decisions v1 station.
 * Per MASTER_BACKLOG.md M5 and docs/audits/AUDIT-2026-09-04-pr4-ui-alpha.md
 * (P0-05), these are explicitly GENERIC engineering scenarios — not tied to
 * Juan's professional experience, because no verified content exists yet. They
 * demonstrate engineering judgment without inventing a professional claim.
 */
export const ENGINEERING_DECISIONS: EngineeringDecision[] = [
  {
    id: 'cache-vs-database',
    question: 'Where should frequently read data live?',
    options: [
      {
        label: 'Cache (in-memory, e.g. Redis)',
        summary: 'Extremely fast reads, but data can be stale and needs an eviction/consistency strategy.',
      },
      {
        label: 'Database (system of record)',
        summary: 'Authoritative and durable, but slower to read repeatedly and more expensive under high read load.',
      },
    ],
    reasoning:
      'A cache sits in front of the database to serve hot reads: it trades a bounded risk of staleness and cache misses for much lower read latency and reduced load on the system of record.',
    guidance:
      'Use a cache when reads are hot and repeated and small staleness is acceptable. Read from the database directly when strong guarantees matter or the read pattern is mostly cold.',
  },
  {
    id: 'sql-vs-nosql',
    question: 'How should the data model be stored?',
    options: [
      {
        label: 'SQL (relational)',
        summary: 'Strong schema, joins, and ACID transactions; fits clearly relational data.',
      },
      {
        label: 'NoSQL (document / columnar / key-value)',
        summary: 'Flexible schema and horizontal scale; often eventual consistency and app-managed integrity.',
      },
    ],
    reasoning:
      'SQL provides strong consistency and relational integrity; NoSQL trades some of those guarantees for flexibility and scale. The right choice depends on the query patterns and consistency needs of the specific workload, not on which is "better" in general.',
    guidance:
      'Choose SQL when relationships and transactional integrity matter. Consider NoSQL for high-write, scale-out, or flexible-schema workloads — but own the consistency consequences.',
  },
  {
    id: 'optimistic-vs-pessimistic-concurrency',
    question: 'How should concurrent writers coordinate?',
    options: [
      {
        label: 'Optimistic concurrency',
        summary: 'Assume no conflict, then version-check and retry on write.',
      },
      {
        label: 'Pessimistic concurrency',
        summary: 'Lock the resource before writing so conflicting writes cannot interleave.',
      },
    ],
    reasoning:
      'Optimistic concurrency scales better when conflicts are rare, pushing the retry cost onto writers. Pessimistic locking gives simple, safe semantics but can become a bottleneck under high contention.',
    guidance:
      'Prefer optimistic when conflicts are rare and retries are cheap. Use pessimistic when a lost update is unacceptable and contention is expected.',
  },
]
