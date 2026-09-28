// CHAR-33 parity test for src/app/item-details/item-details.component.{ts,html} (lazy route from
// item-details.module.ts): Loader while loading, ErrorMessage on failure, scrollTo(0, 0) on init, back button
// (Location.back()), hasUrl title link (external href vs /item/:id), domain, points/user/time_ago/comment count
// subtext, openLinkInNewTab target/rel, [innerHTML] content, poll options with vote bars, and the app-comment list.
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AsyncState, Comment as HNComment, Story } from '../../api'
import { useItem } from '../../api'
import { SettingsProvider } from '../../settings'
import { renderWithProviders } from '../../test/renderWithProviders'
import { ItemDetails } from './ItemDetails'

vi.mock('../../api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../api')>()),
  useItem: vi.fn(),
}))

const mockedUseItem = vi.mocked(useItem)

function mockItemState(state: Partial<AsyncState<Story>>) {
  mockedUseItem.mockReturnValue({ data: undefined, loading: false, error: undefined, ...state })
}

function makeStory(overrides: Partial<Story> = {}): Story {
  return {
    id: 42,
    title: 'A story title',
    points: 120,
    user: 'pg',
    time: 1_600_000_000,
    time_ago: '3 hours ago',
    type: 'story',
    url: 'https://example.com/article',
    domain: 'example.com',
    comments: [],
    comments_count: 3,
    ...overrides,
  }
}

function makeComment(id: number, user: string, comments: HNComment[] = []): HNComment {
  return { id, user, level: 0, time: 1_600_000_000, time_ago: '1 hour ago', content: `<p>by ${user}</p>`, comments }
}

function renderAtItem(id = 42) {
  return renderWithProviders(<ItemDetails />, { path: '/item/:id', route: `/item/${id}` })
}

const laptop = (container: HTMLElement) => container.querySelector('.laptop') as HTMLElement
const mobile = (container: HTMLElement) => container.querySelector('.mobile') as HTMLElement

beforeEach(() => {
  mockedUseItem.mockReset()
  vi.mocked(window.scrollTo).mockClear()
})

afterEach(() => {
  localStorage.clear()
})

describe('ItemDetails', () => {
  it('shows the loader while loading, requests the numeric :id and scrolls to the top', () => {
    mockItemState({ loading: true })
    const { container } = renderAtItem(42)

    expect(mockedUseItem).toHaveBeenCalledWith(42)
    expect(container.querySelector('.app-loader')).toBeInTheDocument()
    expect(container.querySelector('.app-error-message')).not.toBeInTheDocument()
    expect(container.querySelector('.item')).not.toBeInTheDocument()
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
  })

  it('shows the error message instead of the loader when the item fails to load', () => {
    mockItemState({ error: new Error('boom') })
    const { container } = renderAtItem()

    expect(screen.getByText('Could not load item comments.')).toHaveClass('strong')
    expect(container.querySelector('.app-loader')).not.toBeInTheDocument()
    expect(container.querySelector('.item')).not.toBeInTheDocument()
  })

  it('renders a story with an external url: title links, domain and subtext', () => {
    mockItemState({ data: makeStory() })
    const { container } = renderAtItem()

    for (const header of [mobile(container), laptop(container)]) {
      const title = within(header).getByRole('link', { name: 'A story title' })
      expect(title).toHaveClass('title')
      expect(title).toHaveAttribute('href', 'https://example.com/article')
    }
    expect(mobile(container)).toHaveClass('item-header')
    expect(mobile(container).querySelector('.title-block .back-button')).toBeInTheDocument()

    expect(laptop(container)).toHaveClass('item-header')
    expect(within(laptop(container)).getByText('(example.com)')).toHaveClass('domain')

    const subtext = laptop(container).querySelector('.subtext') as HTMLElement
    expect(subtext).toHaveTextContent('120 points by pg 3 hours ago | 3 comments')
    expect(within(subtext).getByRole('link', { name: 'pg' })).toHaveAttribute('href', '/user/pg')
    expect(within(subtext).getByRole('link', { name: '3 comments' })).toHaveAttribute('href', '/item/42')
    expect(within(subtext).getByText(/3 hours ago/)).toHaveClass('item-details')
  })

  it('renders an Ask HN post: internal title link, "discuss" and HTML content', () => {
    mockItemState({
      data: makeStory({
        id: 7,
        title: 'Ask HN: Anything?',
        url: 'item?id=7',
        domain: undefined,
        comments_count: 0,
        content: '<p>Question <i>body</i></p>',
      }),
    })
    const { container } = renderAtItem(7)

    for (const header of [mobile(container), laptop(container)]) {
      const title = within(header).getByRole('link', { name: 'Ask HN: Anything?' })
      expect(title).toHaveAttribute('href', '/item/7')
      expect(title).not.toHaveAttribute('target')
    }
    expect(container.querySelector('.domain')).not.toBeInTheDocument()
    expect(laptop(container)).not.toHaveClass('item-header')
    expect(within(laptop(container)).getByRole('link', { name: 'discuss' })).toHaveAttribute('href', '/item/7')
    expect((container.querySelector('p.subject') as HTMLElement).innerHTML).toBe('<p>Question <i>body</i></p>')
  })

  it('renders a job without points, user or comment link', () => {
    mockItemState({ data: makeStory({ type: 'job', points: null, user: null, comments_count: 0 }) })
    const { container } = renderAtItem()

    const subtext = laptop(container).querySelector('.subtext') as HTMLElement
    expect(subtext).toHaveTextContent(/^3 hours ago$/)
    expect(within(subtext).queryByRole('link')).not.toBeInTheDocument()
    expect(subtext.querySelector('.item-details')).not.toBeInTheDocument()
    expect(laptop(container)).toHaveClass('item-header')
  })

  it('renders poll options with their points and a bar sized by share of poll_votes_count', () => {
    mockItemState({
      data: makeStory({
        type: 'poll',
        url: 'item?id=42',
        poll: [
          { content: '<p>Yes</p>', points: 3 },
          { content: '<p>No</p>', points: 1 },
        ],
        poll_votes_count: 4,
      }),
    })
    const { container } = renderAtItem()

    const options = container.querySelectorAll('.pollResults > .pollContent')
    expect(options).toHaveLength(2)
    const [yes, no] = Array.from(options) as HTMLElement[]
    expect((yes.firstElementChild as HTMLElement).innerHTML).toBe('<p>Yes</p>')
    expect(within(yes).getByText('3 points')).toHaveClass('subtext')
    expect(yes.querySelector('.pollBar')).toHaveStyle({ width: '75%' })
    expect((no.firstElementChild as HTMLElement).innerHTML).toBe('<p>No</p>')
    expect(within(no).getByText('1 points')).toHaveClass('subtext')
    expect(no.querySelector('.pollBar')).toHaveStyle({ width: '25%' })
  })

  it('does not render poll results for non-poll items', () => {
    mockItemState({ data: makeStory() })
    const { container } = renderAtItem()
    expect(container.querySelector('.pollResults')).not.toBeInTheDocument()
  })

  it('renders top-level comments with the recursive Comment component', () => {
    mockItemState({
      data: makeStory({
        comments: [makeComment(1, 'alice', [makeComment(2, 'bob', [makeComment(3, 'carol')])]), makeComment(4, 'dave')],
      }),
    })
    const { container } = renderAtItem()

    const list = container.querySelector('ul.comment-list') as HTMLElement
    expect(list.children).toHaveLength(2)
    expect(list.querySelectorAll('.app-comment')).toHaveLength(4)
    for (const user of ['alice', 'bob', 'carol', 'dave']) {
      expect(within(list).getByRole('link', { name: user })).toHaveAttribute('href', `/user/${user}`)
    }
  })

  it('opens external title links in the current tab when openLinkInNewTab is off', () => {
    mockItemState({ data: makeStory() })
    renderAtItem()

    for (const link of screen.getAllByRole('link', { name: 'A story title' })) {
      expect(link).not.toHaveAttribute('target')
      expect(link).not.toHaveAttribute('rel')
    }
  })

  it('opens external title links in a new tab when openLinkInNewTab is on', () => {
    localStorage.setItem('openLinkInNewTab', 'true')
    mockItemState({ data: makeStory() })
    renderAtItem()

    const links = screen.getAllByRole('link', { name: 'A story title' })
    expect(links).toHaveLength(2)
    for (const link of links) {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener')
    }
  })

  it('navigates back in history when the back button is clicked', async () => {
    mockItemState({ data: makeStory() })
    const { container } = render(
      <SettingsProvider>
        <MemoryRouter initialEntries={['/news/1', '/item/42']} initialIndex={1}>
          <Routes>
            <Route path="/news/:page" element={<div>news feed</div>} />
            <Route path="/item/:id" element={<ItemDetails />} />
          </Routes>
        </MemoryRouter>
      </SettingsProvider>,
    )

    await userEvent.click(container.querySelector('.back-button') as HTMLElement)
    expect(screen.getByText('news feed')).toBeInTheDocument()
  })
})
