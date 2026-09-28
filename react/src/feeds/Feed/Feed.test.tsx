// CHAR-33: parity test for the React port of the feed page. Mirrors the Angular template
// src/app/feeds/feed/feed.component.html and class src/app/feeds/feed/feed.component.ts.
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HN_API_BASE_URL, type FeedType, type Story } from '../../api'
import { renderWithProviders } from '../../test/renderWithProviders'
import { Feed } from './Feed'

function stories(count: number, firstId = 1): Story[] {
  return Array.from({ length: count }, (_, i) => ({
    id: firstId + i,
    title: `Story ${firstId + i}`,
    points: 10,
    user: 'pg',
    time: 1700000000,
    time_ago: '1 hour ago',
    type: 'story',
    url: `https://example.com/${firstId + i}`,
    domain: 'example.com',
    comments: [],
    comments_count: 0,
  }))
}

function mockFeed(pages: Record<string, Story[]>) {
  const fetchMock = vi.fn(async (url: string) => {
    const path = url.replace(HN_API_BASE_URL, '')
    if (!(path in pages)) return new Response('error', { status: 500 })
    return new Response(JSON.stringify(pages[path]), { status: 200 })
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function renderFeed(feedType: FeedType, page?: number) {
  const route = page === undefined ? `/${feedType}` : `/${feedType}/${page}`
  const path = page === undefined ? `/${feedType}` : `/${feedType}/:page`
  return renderWithProviders(<Feed feedType={feedType} />, { route, path })
}

async function findList() {
  return (await screen.findByRole('list')) as HTMLOListElement
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.mocked(window.scrollTo).mockClear()
})

describe('Feed', () => {
  it('shows the loader inside .main-content until the feed arrives', async () => {
    mockFeed({ '/news?page=1': stories(3) })
    const { container } = renderFeed('news', 1)
    expect(container.querySelector('.app-feed > .main-content')).toBeInTheDocument()
    expect(container.querySelector('.main-content .app-loader')).toBeInTheDocument()
    await findList()
    expect(container.querySelector('.app-loader')).toBeNull()
  })

  it.each<FeedType>(['news', 'newest', 'show', 'ask', 'jobs'])('shows the error message for %s', async (feedType) => {
    mockFeed({})
    const { container } = renderFeed(feedType, 1)
    expect(await screen.findByText(`Could not load ${feedType} stories.`)).toHaveClass('strong')
    expect(container.querySelector('.app-loader')).toBeNull()
    expect(screen.queryByRole('list')).toBeNull()
  })

  it('renders each story in an li.post with the Item block directly inside', async () => {
    mockFeed({ '/news?page=1': stories(3) })
    renderFeed('news', 1)
    const list = await findList()
    const posts = list.querySelectorAll(':scope > li.post')
    expect(posts).toHaveLength(3)
    posts.forEach((post) => expect(post.firstElementChild).toHaveClass('item', 'item-block'))
    expect(screen.getByRole('link', { name: 'Story 1' })).toHaveAttribute('href', 'https://example.com/1')
  })

  it('shows the jobs header with the Triplebyte link only on the jobs feed', async () => {
    mockFeed({ '/jobs?page=1': stories(2), '/news?page=1': stories(2) })
    const { container, unmount } = renderFeed('jobs', 1)
    await findList()
    const header = container.querySelector('p.job-header')
    expect(header).toHaveTextContent('These are jobs at startups that were funded by Y Combinator.')
    expect(screen.getByRole('link', { name: 'Triplebyte' })).toHaveAttribute('href', 'https://triplebyte.com/?ref=yc_jobs')
    unmount()

    const news = renderFeed('news', 1)
    await findList()
    expect(news.container.querySelector('.job-header')).toBeNull()
  })

  it('adds list-margin to the list on every feed except jobs', async () => {
    mockFeed({ '/jobs?page=1': stories(2), '/ask?page=1': stories(2) })
    const jobs = renderFeed('jobs', 1)
    expect(await findList()).not.toHaveClass('list-margin')
    jobs.unmount()

    renderFeed('ask', 1)
    expect(await findList()).toHaveClass('list-margin')
  })

  it('numbers the list from 1 on page 1 and from 61 on page 3', async () => {
    mockFeed({ '/news?page=1': stories(30), '/news?page=3': stories(30, 61) })
    const first = renderFeed('news', 1)
    expect((await findList()).start).toBe(1)
    first.unmount()

    renderFeed('news', 3)
    expect((await findList()).start).toBe(61)
  })

  it('defaults to page 1 without a page param', async () => {
    const fetchMock = mockFeed({ '/show?page=1': stories(2) })
    renderFeed('show')
    expect((await findList()).start).toBe(1)
    expect(fetchMock).toHaveBeenCalledWith(`${HN_API_BASE_URL}/show?page=1`, expect.anything())
  })

  it('hides Prev on page 1 and links Prev to the previous page otherwise', async () => {
    mockFeed({ '/newest?page=1': stories(5), '/newest?page=2': stories(5) })
    const first = renderFeed('newest', 1)
    await findList()
    expect(screen.queryByText('‹ Prev')).toBeNull()
    first.unmount()

    const second = renderFeed('newest', 2)
    await findList()
    const prev = screen.getByRole('link', { name: '‹ Prev' })
    expect(prev).toHaveClass('prev')
    expect(prev).toHaveAttribute('href', '/newest/1')
    expect(prev.parentElement).toHaveClass('nav')
    second.unmount()
  })

  it('shows More only for a full page of 30 stories', async () => {
    mockFeed({ '/news?page=2': stories(30, 31), '/show?page=2': stories(29) })
    const full = renderFeed('news', 2)
    await findList()
    const more = screen.getByRole('link', { name: 'More ›' })
    expect(more).toHaveClass('more')
    expect(more).toHaveAttribute('href', '/news/3')
    full.unmount()

    renderFeed('show', 2)
    await findList()
    expect(screen.queryByText('More ›')).toBeNull()
  })

  it('requests /<feed>?page=<n> and scrolls to the top once loaded', async () => {
    const fetchMock = mockFeed({ '/ask?page=4': stories(2) })
    renderFeed('ask', 4)
    await findList()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(`${HN_API_BASE_URL}/ask?page=4`, expect.anything())
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
  })

  it('refetches when the page param changes', async () => {
    const fetchMock = mockFeed({ '/news?page=1': stories(30), '/news?page=2': stories(30, 31) })
    renderFeed('news', 1)
    await findList()
    await userEvent.click(screen.getByRole('link', { name: 'More ›' }))
    expect(await screen.findByRole('link', { name: 'Story 31' })).toBeInTheDocument()
    expect((await findList()).start).toBe(31)
    expect(fetchMock).toHaveBeenLastCalledWith(`${HN_API_BASE_URL}/news?page=2`, expect.anything())
    expect(screen.getByRole('link', { name: '‹ Prev' })).toHaveAttribute('href', '/news/1')
  })

  it('refetches when the feed type changes', async () => {
    const fetchMock = mockFeed({ '/news?page=1': stories(2), '/newest?page=1': stories(2, 100) })
    const { rerender } = renderWithProviders(<Feed feedType="news" />, { route: '/feed/1', path: '/feed/:page' })
    await screen.findByRole('link', { name: 'Story 1' })
    rerender(<Feed feedType="newest" />)
    await waitFor(() => expect(fetchMock).toHaveBeenLastCalledWith(`${HN_API_BASE_URL}/newest?page=1`, expect.anything()))
    expect(await screen.findByRole('link', { name: 'Story 100' })).toBeInTheDocument()
  })
})
