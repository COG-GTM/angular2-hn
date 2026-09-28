// CHAR-33: parity test for the React port of the Angular UserComponent.
// Mirrors src/app/user/user.component.html (loader / error / profile template) and
// src/app/user/user.component.ts (fetchUser(params.id), 'Could not load user <id>.' error, goBack()).
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { HN_API_BASE_URL, type User as HnUser } from '../../api'
import { SettingsProvider } from '../../settings'
import { renderWithProviders } from '../../test/renderWithProviders'
import { User } from './User'

const pg: HnUser = {
  id: 'pg',
  created_time: 1160418092,
  created: '18 years ago',
  karma: 157316,
  avg: 0,
  about: 'Bug fixer.<p><a href="http://paulgraham.com">paulgraham.com</a></p><pre><code>code</code></pre>',
}

function stubFetch(impl: (url: string) => Promise<Response>) {
  const fetchMock = vi.fn(impl)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function renderUser(id = 'pg') {
  return renderWithProviders(<User />, { path: '/user/:id', route: `/user/${id}` })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('User', () => {
  it('requests /user/:id for the route id', async () => {
    const fetchMock = stubFetch(async () => new Response(JSON.stringify(pg), { status: 200 }))
    renderUser('pg')

    await screen.findByText('Profile: pg')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(`${HN_API_BASE_URL}/user/pg`, expect.anything())
  })

  it('shows only the Loader while the user is loading', () => {
    stubFetch(() => new Promise<Response>(() => {}))
    const { container } = renderUser()

    const root = container.firstElementChild as HTMLElement
    expect(root).toHaveClass('app-user')
    expect(root.children).toHaveLength(1)
    expect(root.firstElementChild).toHaveClass('app-loader')
    expect(container.querySelector('.app-error-message')).toBeNull()
    expect(container.querySelector('.profile')).toBeNull()
  })

  it("shows ErrorMessage 'Could not load user <id>.' when the request fails", async () => {
    stubFetch(async () => new Response('not found', { status: 404 }))
    const { container } = renderUser('nobody')

    await waitFor(() => expect(container.querySelector('.app-error-message')).not.toBeNull())
    expect(container.querySelector('.error-section p.strong')).toHaveTextContent(/^Could not load user nobody\.$/)
    expect(container.querySelector('.app-loader')).toBeNull()
    expect(container.querySelector('.profile')).toBeNull()
  })

  it('renders the full profile with the Angular template markup', async () => {
    stubFetch(async () => new Response(JSON.stringify(pg), { status: 200 }))
    const { container } = renderUser()

    await screen.findByText('Profile: pg')
    expect(container.querySelector('.app-loader')).toBeNull()
    expect(container.querySelector('.app-error-message')).toBeNull()

    const profile = container.querySelector('.app-user > .profile') as HTMLElement
    expect(Array.from(profile.children).map((el) => el.className)).toEqual([
      'mobile item-header',
      'main-details',
      'other-details',
    ])

    const titleBlock = profile.querySelector('.mobile.item-header > p.title-block') as HTMLElement
    expect(titleBlock.querySelector(':scope > span.back-button')).not.toBeNull()
    expect(titleBlock.textContent?.trim()).toBe('Profile: pg')

    const details = profile.querySelector('.main-details') as HTMLElement
    expect(Array.from(details.children).map((el) => `${el.tagName.toLowerCase()}.${el.className}`)).toEqual([
      'span.name',
      'span.right',
      'p.age',
    ])
    expect(details.querySelector('.name')).toHaveTextContent(/^pg$/)
    expect(details.querySelector('.right')).toHaveTextContent(/^157316 ★$/)
    expect(details.querySelector('.age')).toHaveTextContent(/^Created 18 years ago$/)
  })

  it('renders about as HTML inside .other-details > p', async () => {
    stubFetch(async () => new Response(JSON.stringify(pg), { status: 200 }))
    const { container } = renderUser()

    await screen.findByText('Profile: pg')
    const about = container.querySelector('.other-details > p') as HTMLElement
    expect(about.innerHTML).toBe(pg.about)
    expect(about.querySelector('a')).toHaveAttribute('href', 'http://paulgraham.com')
    expect(about.querySelector('pre > code')).toHaveTextContent('code')
  })

  it('omits .other-details when the user has no about', async () => {
    stubFetch(async () => new Response(JSON.stringify({ ...pg, about: undefined }), { status: 200 }))
    const { container } = renderUser()

    await screen.findByText('Profile: pg')
    expect(container.querySelector('.other-details')).toBeNull()
  })

  it('goes back in history when the back button is clicked (Location.back())', async () => {
    stubFetch(async () => new Response(JSON.stringify(pg), { status: 200 }))
    const { container } = render(
      <SettingsProvider>
        <MemoryRouter initialEntries={['/news/1', '/user/pg']} initialIndex={1}>
          <Routes>
            <Route path="/news/:page" element={<p>news feed</p>} />
            <Route path="/user/:id" element={<User />} />
          </Routes>
        </MemoryRouter>
      </SettingsProvider>,
    )

    await screen.findByText('Profile: pg')
    fireEvent.click(container.querySelector('.back-button') as HTMLElement)
    expect(await screen.findByText('news feed')).toBeInTheDocument()
  })
})
