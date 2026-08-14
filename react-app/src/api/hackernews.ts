import type { PollResult, Story, User } from '../models';

export const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, init);
  if (!response.ok) {
    throw new Error(`Request to ${path} failed with status ${response.status}`);
  }
  return (await response.json()) as T;
}

export function fetchFeed(feedType: string, page: number, init?: RequestInit): Promise<Story[]> {
  return getJson<Story[]>(`/${feedType}?page=${page}`, init);
}

export function fetchPollContent(id: number, init?: RequestInit): Promise<PollResult> {
  return getJson<PollResult>(`/item/${id}`, init);
}

export async function fetchItemContent(id: number, init?: RequestInit): Promise<Story> {
  const story = await getJson<Story>(`/item/${id}`, init);
  if (story.type === 'poll' && story.poll) {
    const results = await Promise.all(
      story.poll.map((_, index) => fetchPollContent(story.id + index + 1, init))
    );
    story.poll = results;
    story.poll_votes_count = results.reduce((total, result) => total + result.points, 0);
  }
  return story;
}

export function fetchUser(id: string, init?: RequestInit): Promise<User> {
  return getJson<User>(`/user/${id}`, init);
}
