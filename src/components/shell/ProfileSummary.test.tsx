import { render, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProfileSummary } from './ProfileSummary'

describe('ProfileSummary', () => {
  it('renders nothing (neutral absence) when no profile is published, never placeholder filler', async () => {
    const { container } = render(<ProfileSummary />)
    await waitFor(() => expect(container).toBeEmptyDOMElement())
  })
})
