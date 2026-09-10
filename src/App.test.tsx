import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the semantic shell identity and an entry action', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /juan.?s homelab/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enter homelab/i })).toBeInTheDocument()
  })

  it('falls back to a semantic notice instead of a blank screen when WebGL is unavailable', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /enter homelab/i }))
    // jsdom has no WebGL support, so entry must resolve to the semantic notice, never a crash or blank state.
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })
})
