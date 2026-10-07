import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { SettingsProvider } from '../context/SettingsContext'
import { fetchFeed, fetchItemContent, fetchUser } from '../services/hackernewsApi'
import type { Story } from '../types/Story'
import { makeComment, makeStory, makeUser } from './fixtures'
import Feed from '../pages/Feed'
import ItemDetails from '../pages/ItemDetails'
import User from '../pages/User'

vi.mock('../services/hackernewsApi', () => ({
  fetchFeed: vi.fn(),
  fetchItemContent: vi.fn(),
  fetchUser: vi.fn(),
}))

const feedRequest = vi.mocked(fetchFeed)
const itemRequest = vi.mocked(fetchItemContent)
const userRequest = vi.mocked(fetchUser)

function withSettings(children: ReactNode) {
  return <SettingsProvider>{children}</SettingsProvider>
}

function makeStories(count: number): Story[] {
  return Array.from({ length: count }, (_, index) => makeStory({ id: index + 1, title: `Story ${index + 1}` }))
}

describe('Feed page', () => {
  beforeEach(() => {
    feedRequest.mockReset()
  })

  it('renders a numbered 30-story page with More and Prev links', async () => {
    feedRequest.mockResolvedValue(makeStories(30))
    const user = userEvent.setup()
    render(withSettings(
      <MemoryRouter initialEntries={['/news/1']}>
        <Routes>
          <Route path="/news/:page" element={<Feed feedType="news" />} />
        </Routes>
      </MemoryRouter>,
    ))

    expect(await screen.findByText('Story 30')).toBeInTheDocument()
    expect(screen.getByRole('list')).toHaveAttribute('start', '1')
    expect(screen.getAllByRole('listitem')).toHaveLength(30)
    await user.click(screen.getByRole('link', { name: /More/ }))
    await waitFor(() => expect(screen.getByRole('list')).toHaveAttribute('start', '31'))
    expect(screen.getByRole('link', { name: /Prev/ })).toHaveAttribute('href', '/news/1')
    expect(feedRequest).toHaveBeenLastCalledWith('news', 2, expect.any(AbortSignal))
  })

  it('shows a feed error when no items have loaded', async () => {
    feedRequest.mockRejectedValue(new Error('offline'))
    render(withSettings(
      <MemoryRouter initialEntries={['/show/1']}>
        <Routes>
          <Route path="/show/:page" element={<Feed feedType="show" />} />
        </Routes>
      </MemoryRouter>,
    ))
    expect(await screen.findByText('Could not load show stories.')).toBeInTheDocument()
  })
})

describe('ItemDetails page', () => {
  beforeEach(() => {
    itemRequest.mockReset()
  })

  it('renders the story and its comments', async () => {
    itemRequest.mockResolvedValue(makeStory({
      id: 5,
      title: 'Detailed story',
      content: '<strong>Story body</strong>',
      comments: [makeComment()],
      comments_count: 1,
    }))
    render(withSettings(
      <MemoryRouter initialEntries={['/item/5']}>
        <Routes>
          <Route path="/item/:id" element={<ItemDetails />} />
        </Routes>
      </MemoryRouter>,
    ))

    expect(await screen.findAllByText('Detailed story')).toHaveLength(2)
    expect(screen.getByText('Story body').tagName).toBe('STRONG')
    expect(screen.getByText('A comment')).toBeInTheDocument()
  })

  it('shows the item comments error on failure', async () => {
    itemRequest.mockRejectedValue(new Error('offline'))
    render(withSettings(
      <MemoryRouter initialEntries={['/item/5']}>
        <Routes>
          <Route path="/item/:id" element={<ItemDetails />} />
        </Routes>
      </MemoryRouter>,
    ))
    expect(await screen.findByText('Could not load item comments.')).toBeInTheDocument()
  })
})

describe('User page', () => {
  beforeEach(() => {
    userRequest.mockReset()
  })

  it('renders karma and about text', async () => {
    userRequest.mockResolvedValue(makeUser({ about: '<p>About Alice</p>' }))
    render(withSettings(
      <MemoryRouter initialEntries={['/user/alice']}>
        <Routes>
          <Route path="/user/:id" element={<User />} />
        </Routes>
      </MemoryRouter>,
    ))
    expect(await screen.findByText('123 ★')).toBeInTheDocument()
    expect(screen.getByText('About Alice')).toBeInTheDocument()
  })

  it('shows the user error when the profile fails to load', async () => {
    userRequest.mockRejectedValue(new Error('offline'))
    render(withSettings(
      <MemoryRouter initialEntries={['/user/missing']}>
        <Routes>
          <Route path="/user/:id" element={<User />} />
        </Routes>
      </MemoryRouter>,
    ))
    expect(await screen.findByText('Could not load user missing.')).toBeInTheDocument()
  })
})

describe('App routing', () => {
  beforeEach(() => {
    feedRequest.mockReset()
    feedRequest.mockResolvedValue([makeStory()])
    window.history.replaceState({}, '', '/')
  })

  it('redirects / to the news feed', async () => {
    const App = (await import('../App')).default
    render(<App />)
    expect(await screen.findByText('A Hacker News story')).toBeInTheDocument()
    expect(feedRequest).toHaveBeenCalledWith('news', 1, expect.any(AbortSignal))
    expect(window.location.pathname).toBe('/news/1')
  })
})
