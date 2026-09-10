import type { Page } from '@playwright/test'

/**
 * P1-02: strengthen the public/private network boundary assertion.
 *
 * Rather than a string-only `/supabase/i` denylist, the browser's traffic is
 * constrained by BOTH an explicit allowlist of permitted hosts AND an explicit
 * denylist of forbidden private identifiers, derived from the accepted
 * architecture (docs/architecture/PORTFOLIO_KNOWLEDGE_ARCHITECTURE.md).
 *
 * Allowlist first: every request host must be the app's own origin. This is
 * the key strengthening — a renamed proxy/private endpoint can't bypass a
 * string-only denylist because it would fail the host allowlist check.
 */

export const APP_ORIGIN = 'http://localhost:4173'

/**
 * The private Second Brain lives in Supabase. A renamed proxy still must make
 * an HTTP request from the browser; the allowlist host check below forbids any
 * non-app origin, and the denylist identifiers catch in-app markers that would
 * indicate direct private data access.
 */
export const SECONDBRAIN_PROJECT_ID = 'oweqrcmxmmxzyahyleap'

/** Every host the browser is permitted to contact. */
export const ALLOWED_HOSTS: readonly string[] = [new URL(APP_ORIGIN).host]

/** Forbidden identifiers present in any request URL indicate private access. */
export const FORBIDDEN_URL_PATTERNS: readonly string[] = [
  SECONDBRAIN_PROJECT_ID,
  'supabase',
  'supabase.co',
  'supabase.in',
  'rest/v1',
  'graphql',
  'rpc',
]

export interface RequestAudit {
  readonly urls: readonly string[]
  readonly violations: readonly string[]
  readonly requests: number
}

/**
 * Attach a request listener before navigation and return an audit object that
 * classifies every request against the allowlist and denylist. Assert on the
 * returned `violations` at the end of the critical path.
 */
export function auditNetworkRequests(page: Page): RequestAudit {
  const urls: string[] = []
  const violations: string[] = []

  page.on('request', (request) => {
    const url = request.url()
    urls.push(url)

    let host: string
    try {
      host = new URL(url).host
    } catch {
      violations.push(`request is not a valid URL: ${url}`)
      return
    }

    if (!ALLOWED_HOSTS.includes(host)) {
      violations.push(`request to disallowed host '${host}' (allowed: ${ALLOWED_HOSTS.join(', ')}): ${url}`)
    }

    for (const pattern of FORBIDDEN_URL_PATTERNS) {
      if (url.includes(pattern)) {
        violations.push(`request URL contains forbidden private identifier '${pattern}': ${url}`)
      }
    }
  })

  return {
    get urls() {
      return urls
    },
    get violations() {
      return violations
    },
    get requests() {
      return urls.length
    },
  }
}
