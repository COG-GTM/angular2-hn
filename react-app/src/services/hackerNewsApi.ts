import type { PollResult, Story, User } from '../models'

export type FeedName = 'news' | 'newest' | 'show' | 'ask' | 'jobs'

export const BASE_URL = 'https://node-hnapi.herokuapp.com'

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    throw new Error(`Request to ${url} failed with status ${res.status}`)
  }
  return (await res.json()) as T
}

export function fetchFeed(feedType: FeedName, page: number, init?: RequestInit): Promise<Story[]> {
  return fetchJson<Story[]>(`${BASE_URL}/${feedType}?page=${page}`, init)
}

export function fetchPollContent(id: number, init?: RequestInit): Promise<PollResult> {
  return fetchJson<PollResult>(`${BASE_URL}/item/${id}`, init)
}

export async function fetchItemContent(id: number, init?: RequestInit): Promise<Story> {
  const story = await fetchJson<Story>(`${BASE_URL}/item/${id}`, init)
  if (story.type === 'poll' && Array.isArray(story.poll)) {
    const results = await Promise.all(
      story.poll.map((_, i) => fetchPollContent(story.id + i + 1, init)),
    )
    story.poll = results
    story.poll_votes_count = results.reduce((sum, r) => sum + (r.points ?? 0), 0)
  }
  return story
}

export function fetchUser(id: string, init?: RequestInit): Promise<User> {
  return fetchJson<User>(`${BASE_URL}/user/${id}`, init)
}
