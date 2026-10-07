import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithAppProviders, makeStory } from '../test/fixtures'
import Item from './Item'

describe('Item', () => {
  it('uses an external URL when one is present', () => {
    renderWithAppProviders(<Item item={makeStory({ url: 'https://example.com/story' })} />)
    expect(screen.getByRole('link', { name: 'A Hacker News story' })).toHaveAttribute(
      'href',
      'https://example.com/story',
    )
  })

  it('links stories without an external URL to their item page', () => {
    renderWithAppProviders(<Item item={makeStory({ id: 42 })} />)
    expect(screen.getByRole('link', { name: 'A Hacker News story' })).toHaveAttribute('href', '/item/42')
  })

  it('hides points and user details for jobs', () => {
    renderWithAppProviders(<Item item={makeStory({ type: 'job' })} />)
    expect(screen.queryByText('alice')).not.toBeInTheDocument()
    expect(screen.queryByText(/points by/)).not.toBeInTheDocument()
  })

  it('opens external links in a new tab when configured', () => {
    localStorage.setItem('openLinkInNewTab', 'true')
    renderWithAppProviders(<Item item={makeStory({ url: 'https://example.com/story' })} />)
    expect(screen.getByRole('link', { name: 'A Hacker News story' })).toHaveAttribute('target', '_blank')
    expect(screen.getByRole('link', { name: 'A Hacker News story' })).toHaveAttribute('rel', 'noopener')
  })
})
