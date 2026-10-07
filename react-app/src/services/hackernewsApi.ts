import type { Comment } from '../types/Comment'
import type { FeedName } from '../types/FeedType'
import type { PollResult } from '../types/PollResult'
import type { Story } from '../types/Story'
import type { User } from '../types/User'

export const BASE_URL = 'https://node-hnapi.herokuapp.com'
const HNPWA_URL = 'https://api.hnpwa.com/v0'

export async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }
  return (await response.json()) as T
}

export function fetchFeed(feedType: FeedName, page: number, signal?: AbortSignal): Promise<Story[]> {
  return fetchJson<Story[]>(`${BASE_URL}/${feedType}?page=${page}`, signal)
}

export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
  const story = await fetchJson<Story>(`${BASE_URL}/item/${id}`, signal)
  if (story.type === 'poll') {
    const pollResults = await Promise.allSettled(
      story.poll.map((_, index) => fetchPollContent(story.id + index + 1, signal)),
    )
    if (signal?.aborted) {
      const abortResult = pollResults.find(
        (result): result is PromiseRejectedResult =>
          result.status === 'rejected' && result.reason instanceof Error && result.reason.name === 'AbortError',
      )
      throw abortResult?.reason ?? signal.reason ?? new DOMException('Aborted', 'AbortError')
    }
    story.poll = pollResults.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      }
      const original = story.poll[index]
      return { ...original, content: original.content ?? original.item ?? '' }
    })
    story.poll_votes_count = story.poll.reduce((total, result) => total + result.points, 0)
  }
  return story
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
  return fetchJson<PollResult>(`${BASE_URL}/item/${id}`, signal)
}

export async function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
  try {
    const user = await fetchJson<User | null>(`${BASE_URL}/user/${id}`, signal)
    if (!user || typeof user !== 'object') {
      throw new Error('User response was empty')
    }
    return user
  } catch (error) {
    if (signal?.aborted || (error instanceof Error && error.name === 'AbortError')) {
      throw error
    }
    const user = await fetchJson<User | null>(`${HNPWA_URL}/user/${id}.json`, signal)
    if (!user || typeof user !== 'object') {
      throw new Error('User response was empty', { cause: error })
    }
    return user
  }
}

export type { Comment }
