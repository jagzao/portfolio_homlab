import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ExperienceBoundary } from './ExperienceBoundary'

vi.mock('./Experience3D', () => ({
  default: () => {
    throw new Error('simulated WebGL runtime failure')
  },
}))

function mockWebGLAvailable() {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(((contextId: string) => {
    if (contextId === 'webgl2' || contextId === 'webgl') return {} as WebGLRenderingContext
    return null
  }) as typeof HTMLCanvasElement.prototype.getContext)
}

describe('ExperienceBoundary recoverable 3D load failure', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('falls back to a dismissible, retryable notice instead of crashing or staying blank', async () => {
    mockWebGLAvailable()
    const user = userEvent.setup()
    render(<ExperienceBoundary />)

    await user.click(screen.getByRole('button', { name: /enter homelab/i }))

    const notice = await screen.findByRole('alert')
    expect(notice).toHaveTextContent(/3d experience failed to load/i)
    expect(screen.getByRole('button', { name: /try 3d/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /enter homelab/i })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /dismiss notice/i }))
    expect(await screen.findByRole('button', { name: /enter homelab/i })).toBeInTheDocument()
  })
})
