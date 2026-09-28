import type { FeedType, PollResult, Story, User } from './types'

export const HN_API_BASE_URL = 'https://node-hnapi.herokuapp.com'

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${HN_API_BASE_URL}${path}`, { signal })
  if (!res.ok) {
    throw new Error(`Request to ${path} failed with status ${res.status}`)
  }
  return res.json() as Promise<T>
}

export function fetchFeed(feedType: FeedType, page: number, signal?: AbortSignal): Promise<Story[]> {
  return getJson<Story[]>(`/${feedType}?page=${page}`, signal)
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
  return getJson<PollResult>(`/item/${id}`, signal)
}

// Poll options live at consecutive item ids after the poll itself (story.id + 1 .. story.id + n).
export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
  const story = await getJson<Story>(`/item/${id}`, signal)
  if (story.type !== 'poll' || !story.poll) {
    return story
  }
  const poll = await Promise.all(story.poll.map((_, i) => fetchPollContent(story.id + i + 1, signal)))
  return {
    ...story,
    poll,
    poll_votes_count: poll.reduce((total, option) => total + option.points, 0),
  }
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
  return getJson<User>(`/user/${id}`, signal)
}
