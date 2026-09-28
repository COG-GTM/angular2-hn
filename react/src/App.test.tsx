// CHAR-33 parity test for the React app shell. Mirrors src/app/app.component.{ts,html} (theme class wrapper,
// .body-cover, .wrapper with app-header / router-outlet / app-footer), src/app/app.routes.ts ('' → news/1 and the
// news|newest|show|ask|jobs/:page feed routes) and the child routes of src/app/item-details/item-details.module.ts
// (item/:id) and src/app/user/user.module.ts (user/:id). Bare /news etc. redirecting to page 1 is an intentional
// addition (Angular matched no route there).
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useLocation } from 'react-router-dom'
import { HN_API_BASE_URL, type Comment, type FeedType, type Story, type User } from './api'
import { App } from './App'
import { renderWithProviders } from './test/renderWithProviders'

const FEED_TYPES: FeedType[] = ['news', 'newest', 'show', 'ask', 'jobs']

function story(id: number, title: string, overrides: Partial<Story> = {}): Story {
  return {
    id,
    title,
    points: 10,
    user: 'pg',
    time: 1700000000,
    time_ago: '1 hour ago',
    type: 'story',
    url: `https://example.com/${id}`,
    domain: 'example.com',
    comments: [],
    comments_count: 0,
    ...overrides,
  }
}

const comment: Comment = {
  id: 43,
  level: 0,
  user: 'dang',
  time: 1700000000,
  time_ago: '2 hours ago',
  content: '<p>First comment</p>',
  comments: [],
}

const itemStory = story(42, 'Item details title', { comments: [comment], comments_count: 1 })

const user: User = { id: 'pg', created_time: 1160418092, created: '18 years ago', karma: 157316, about: 'Bug fixer.' }

function responses(): Record<string, unknown> {
  const feeds = Object.fromEntries(FEED_TYPES.map((feed, i) => [`/${feed}?page=1`, [story(i + 1, `${feed} story`)]]))
  return { ...feeds, '/item/42': itemStory, '/user/pg': user }
}

function stubApi() {
  const data = responses()
  const fetchMock = vi.fn(async (url: string) => {
    const path = url.replace(HN_API_BASE_URL, '')
    if (!(path in data)) return new Response('not found', { status: 404 })
    return new Response(JSON.stringify(data[path]), { status: 200 })
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function requestedPaths(fetchMock: ReturnType<typeof stubApi>) {
  return fetchMock.mock.calls.map(([url]) => url.replace(HN_API_BASE_URL, ''))
}

function LocationProbe() {
  return <div data-testid="location">{useLocation().pathname}</div>
}

function renderApp(route: string) {
  return renderWithProviders(
    <>
      <App />
      <LocationProbe />
    </>,
    { route },
  )
}

function expectShell(container: HTMLElement) {
  const wrapper = container.querySelector('.app-root > div > .wrapper') as HTMLElement
  expect(container.querySelector('.app-root > div > .body-cover')).toBeInTheDocument()
  expect(wrapper).toBeInTheDocument()
  expect(wrapper.firstElementChild).toHaveClass('app-header')
  expect(wrapper.lastElementChild).toHaveClass('app-footer')
  expect(within(wrapper).getByAltText('Logo')).toBeInTheDocument()
  expect(within(wrapper).getByRole('link', { name: 'GitHub' })).toBeInTheDocument()
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('App', () => {
  it("redirects '' to /news/1 and renders the news feed", async () => {
    const fetchMock = stubApi()
    renderApp('/')

    expect(await screen.findByText('news story')).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('/news/1')
    expect(requestedPaths(fetchMock)).toEqual(['/news?page=1'])
  })

  it.each(FEED_TYPES)('/%s/1 requests /%s?page=1 and renders its items inside the shell', async (feed) => {
    const fetchMock = stubApi()
    const { container } = renderApp(`/${feed}/1`)

    expect(await screen.findByText(`${feed} story`)).toBeInTheDocument()
    expect(requestedPaths(fetchMock)).toEqual([`/${feed}?page=1`])
    expect(container.querySelector('.wrapper > .app-header + .app-feed + .app-footer')).toBeInTheDocument()
    expectShell(container)
  })

  it.each(FEED_TYPES)('redirects bare /%s to page 1', async (feed) => {
    stubApi()
    renderApp(`/${feed}`)

    expect(await screen.findByText(`${feed} story`)).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent(`/${feed}/1`)
  })

  it('renders the jobs header only on /jobs/:page', async () => {
    stubApi()
    const { container, unmount } = renderApp('/jobs/1')
    await screen.findByText('jobs story')
    expect(container.querySelector('.job-header')).toHaveTextContent('These are jobs at startups')
    unmount()

    stubApi()
    const news = renderApp('/news/1')
    await screen.findByText('news story')
    expect(news.container.querySelector('.job-header')).toBeNull()
  })

  it('switching feeds from the header loads the new feed', async () => {
    const fetchMock = stubApi()
    renderApp('/news/1')
    await screen.findByText('news story')

    await userEvent.click(screen.getByRole('link', { name: 'new' }))

    expect(await screen.findByText('newest story')).toBeInTheDocument()
    expect(screen.queryByText('news story')).toBeNull()
    expect(screen.getByTestId('location')).toHaveTextContent('/newest/1')
    expect(requestedPaths(fetchMock)).toEqual(['/news?page=1', '/newest?page=1'])
  })

  it('/item/:id renders the item title and its comments inside the shell', async () => {
    const fetchMock = stubApi()
    const { container } = renderApp('/item/42')

    expect((await screen.findAllByText('Item details title')).length).toBeGreaterThan(0)
    expect(screen.getByText('First comment')).toBeInTheDocument()
    expect(container.querySelector('.app-comment')).toBeInTheDocument()
    expect(requestedPaths(fetchMock)).toEqual(['/item/42'])
    expectShell(container)
  })

  it('/user/:id renders the profile inside the shell', async () => {
    const fetchMock = stubApi()
    const { container } = renderApp('/user/pg')

    expect(await screen.findByText('Profile: pg')).toBeInTheDocument()
    expect(screen.getByText('Created 18 years ago')).toBeInTheDocument()
    expect(requestedPaths(fetchMock)).toEqual(['/user/pg'])
    expectShell(container)
  })

  it('keeps the shell with an empty outlet on unknown routes, like an unmatched Angular route', () => {
    const fetchMock = stubApi()
    const { container } = renderApp('/nope')

    expectShell(container)
    expect(container.querySelector('.wrapper')?.children).toHaveLength(2)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('puts the saved theme on the element wrapping the shell', async () => {
    localStorage.setItem('theme', 'night')
    stubApi()
    const { container } = renderApp('/news/1')
    await screen.findByText('news story')

    const themed = container.querySelector('.app-root > div') as HTMLElement
    expect(themed.className).toBe('night')
    expect(themed.firstElementChild).toHaveClass('body-cover')
  })

  it('updates the theme class when the setting changes', async () => {
    localStorage.setItem('theme', 'default')
    stubApi()
    const { container } = renderApp('/news/1')
    await screen.findByText('news story')

    await userEvent.click(screen.getByAltText('Settings'))
    await userEvent.click(screen.getByLabelText('Black (AMOLED)'))

    await waitFor(() => expect((container.querySelector('.app-root > div') as HTMLElement).className).toBe('amoledblack'))
    expect(localStorage.getItem('theme')).toBe('amoledblack')
  })
})
