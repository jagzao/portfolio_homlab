import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  onError: () => void
}

interface State {
  hasError: boolean
}

/**
 * Catches WebGL init/context-lost failures from the lazy-loaded 3D chunk at
 * runtime, per ADR-002: fall back to the semantic notice immediately, no
 * retry loop blocking content, and stop attempting to re-render the failed
 * subtree.
 */
export class CanvasErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch() {
    this.props.onError()
  }

  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}
