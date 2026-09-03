import type { FeedType } from '../models/feed-type'
import type { PollResult } from '../models/poll-result'
import type { Story } from '../models/story'
import type { User } from '../models/user'

const BASE_URL = 'https://node-hnapi.herokuapp.com'

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }
  return response.json() as Promise<T>
}

export function fetchFeed(feedType: FeedType, page: number): Promise<Story[]> {
  return getJson<Story[]>(`${BASE_URL}/${feedType}?page=${page}`)
}

export function fetchPollContent(id: number): Promise<PollResult> {
  return getJson<PollResult>(`${BASE_URL}/item/${id}`)
}

export function fetchUser(id: string): Promise<User> {
  return getJson<User>(`${BASE_URL}/user/${id}`)
}

export async function fetchItemContent(id: number): Promise<Story> {
  const story = await getJson<Story>(`${BASE_URL}/item/${id}`)
  if (story.type === 'poll') {
    const pollResults = await Promise.all(
      story.poll.map((_, index) => fetchPollContent(story.id + index + 1)),
    )
    story.poll = pollResults
    story.poll_votes_count = pollResults.reduce(
      (total, pollResult) => total + pollResult.points,
      0,
    )
  }
  return story
}
