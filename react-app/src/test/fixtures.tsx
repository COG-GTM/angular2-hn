import { MemoryRouter } from 'react-router-dom'
import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { SettingsProvider } from '../context/SettingsContext'
import type { Comment } from '../types/Comment'
import type { Story } from '../types/Story'
import type { User } from '../types/User'

export function makeComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: 11,
    level: 0,
    user: 'alice',
    time: 1,
    time_ago: '1 hour ago',
    content: 'A comment',
    deleted: false,
    comments: [],
    ...overrides,
  }
}

export function makeStory(overrides: Partial<Story> = {}): Story {
  return {
    id: 1,
    title: 'A Hacker News story',
    points: 10,
    user: 'alice',
    time: 1,
    time_ago: '1 hour ago',
    type: 'story',
    url: '',
    domain: '',
    comments: [],
    comments_count: 0,
    poll: [],
    poll_votes_count: 0,
    deleted: false,
    dead: false,
    content: '',
    ...overrides,
  }
}

export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'alice',
    crated_time: 1,
    created_time: 1,
    created: '10 years ago',
    karma: 123,
    avg: 1,
    about: '',
    ...overrides,
  }
}

export function renderWithAppProviders(ui: ReactNode) {
  return render(
    <SettingsProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </SettingsProvider>,
  )
}
