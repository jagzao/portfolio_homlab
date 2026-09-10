import { useEffect } from 'react'

/** Stable hash fragment that directly targets the Software Engineering Lab. */
export const DEEP_LINK_TARGET = 'software-lab'

/**
 * Resolves a direct-link/deep-link hash fragment (#software-lab) by scrolling
 * the matching element into view and focusing it, so a visitor can reach the
 * Software Engineering Lab semantic content without replaying the 3D arrival.
 *
 * Native hash handling only (no router): reads window.location.hash and
 * re-arms on changes (hashchange), and on first mount so the target is honored
 * even when the page loads directly onto the fragment.
 */
export function useDeepLinkTarget(targetId: string): void {
  useEffect(() => {
    const resolve = () => {
      if (window.location.hash !== `#${targetId}`) return
      const element = document.getElementById(targetId)
      if (!element) return
      element.scrollIntoView({ block: 'start', behavior: 'auto' })
      element.focus({ preventScroll: true })
    }

    resolve()
    window.addEventListener('hashchange', resolve)
    return () => window.removeEventListener('hashchange', resolve)
  }, [targetId])
}
