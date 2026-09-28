// CHAR-33: parity test for the React port of the feed item. Mirrors the Angular template
// src/app/feeds/item/item.component.html and class src/app/feeds/item/item.component.ts.
import { screen, within } from '@testing-library/react'
import type { Story } from '../../api'
import { renderWithProviders } from '../../test/renderWithProviders'
import { Item } from './Item'

function story(overrides: Partial<Story> = {}): Story {
  return {
    id: 42,
    title: 'A story',
    points: 120,
    user: 'pg',
    time: 1700000000,
    time_ago: '3 hours ago',
    type: 'story',
    url: 'https://example.com/post',
    domain: 'example.com',
    comments: [],
    comments_count: 7,
    ...overrides,
  }
}

function renderItem(item: Story) {
  const { container } = renderWithProviders(<Item item={item} />)
  const root = container.firstElementChild as HTMLElement
  return {
    root,
    palm: root.querySelector('.subtext-palm') as HTMLElement,
    laptop: root.querySelector('.subtext-laptop') as HTMLElement,
  }
}

describe('Item', () => {
  it('links the title to an external url and shows the domain', () => {
    const { root } = renderItem(story())
    expect(root).toHaveClass('item', 'item-block')
    const title = screen.getByRole('link', { name: 'A story' })
    expect(title).toHaveClass('title')
    expect(title).toHaveAttribute('href', 'https://example.com/post')
    expect(root.querySelector('.domain')).toHaveTextContent('(example.com)')
  })

  it('omits the domain when the api does not return one', () => {
    const { root } = renderItem(story({ domain: undefined }))
    expect(root.querySelector('.domain')).toBeNull()
  })

  it('links Ask HN (relative url) titles internally to /item/:id', () => {
    const { root } = renderItem(story({ id: 99, title: 'Ask HN: Why?', url: 'item?id=99', domain: undefined }))
    const title = screen.getByRole('link', { name: 'Ask HN: Why?' })
    expect(title).toHaveClass('title')
    expect(title).toHaveAttribute('href', '/item/99')
    expect(title).not.toHaveAttribute('target')
    expect(root.querySelector('.domain')).toBeNull()
  })

  it('opens external links in the same tab by default', () => {
    renderItem(story())
    const title = screen.getByRole('link', { name: 'A story' })
    expect(title).not.toHaveAttribute('target')
    expect(title).not.toHaveAttribute('rel')
  })

  it('opens external links in a new tab when settings.openLinkInNewTab is on', () => {
    localStorage.setItem('openLinkInNewTab', 'true')
    renderItem(story())
    const title = screen.getByRole('link', { name: 'A story' })
    expect(title).toHaveAttribute('target', '_blank')
    expect(title).toHaveAttribute('rel', 'noopener')
  })

  it('binds title font size and list spacing from settings', () => {
    localStorage.setItem('titleFontSize', '20')
    localStorage.setItem('listSpacing', '12')
    const { root } = renderItem(story())
    expect(root).toHaveStyle({ marginBottom: '12px' })
    expect(screen.getByRole('link', { name: 'A story' })).toHaveStyle({ fontSize: '20px' })
  })

  it('uses the settings defaults (16px title, 0px spacing) on internal titles too', () => {
    const { root } = renderItem(story({ url: 'item?id=42' }))
    expect(root).toHaveStyle({ marginBottom: '0px' })
    expect(screen.getByRole('link', { name: 'A story' })).toHaveStyle({ fontSize: '16px' })
  })

  it('renders the mobile (palm) subtext with user, points, time and comment link', () => {
    const { palm } = renderItem(story())
    expect(within(palm).getByRole('link', { name: 'pg' })).toHaveAttribute('href', '/user/pg')
    expect(palm.querySelector('.name')).toHaveTextContent('pg')
    expect(palm.querySelector('.right')).toHaveTextContent('120 ★')
    expect(palm).toHaveTextContent('3 hours ago')
    const comments = palm.querySelector('.comment-number') as HTMLElement
    expect(comments).toHaveAttribute('href', '/item/42')
    expect(comments).toHaveTextContent('• 7 comments')
  })

  it('renders the laptop subtext with points, user, time and comment link', () => {
    const { laptop } = renderItem(story())
    expect(laptop).toHaveTextContent('120 points by pg 3 hours ago | 7 comments')
    expect(within(laptop).getByRole('link', { name: 'pg' })).toHaveAttribute('href', '/user/pg')
    expect(within(laptop).getByRole('link', { name: '7 comments' })).toHaveAttribute('href', '/item/42')
    expect(laptop.querySelector('.item-details')).toHaveTextContent('3 hours ago | 7 comments')
  })

  it.each([
    [0, 'discuss'],
    [1, '1 comment'],
    [7, '7 comments'],
  ])('words a comment count of %i as "%s" in both subtexts', (count, wording) => {
    const { palm, laptop } = renderItem(story({ comments_count: count }))
    expect(palm.querySelector('.comment-number')).toHaveTextContent(`• ${wording}`)
    expect(within(laptop).getByRole('link', { name: wording })).toHaveAttribute('href', '/item/42')
  })

  it('renders job items with only the time: no user, points or comments', () => {
    const { root, palm, laptop } = renderItem(
      story({ type: 'job', title: 'Acme is hiring', points: null, user: null, comments_count: 0, domain: 'acme.com' }),
    )
    expect(screen.getByRole('link', { name: 'Acme is hiring' })).toHaveAttribute('href', 'https://example.com/post')
    expect(root.querySelector('.domain')).toHaveTextContent('(acme.com)')
    expect(screen.getAllByRole('link')).toHaveLength(1)
    expect(palm.querySelectorAll('.details')).toHaveLength(1)
    expect(palm).toHaveTextContent(/^3 hours ago$/)
    expect(palm.querySelector('.comment-number')).toBeNull()
    expect(laptop).toHaveTextContent(/^3 hours ago$/)
    expect(laptop.querySelector('.item-details')).toBeNull()
    expect(laptop).not.toHaveTextContent('points by')
  })
})
