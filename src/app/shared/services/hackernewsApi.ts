import type { Feed } from '../models/feed-type';
import type { PollResult } from '../models/poll-result';
import type { Story } from '../models/story';
import type { User } from '../models/user';

export const API_BASE_URL = 'https://node-hnapi.herokuapp.com';
export const USER_API_BASE_URL = 'https://api.hnpwa.com/v0';

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Request to ${url} failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function fetchFeed(feedType: Feed, page: number, signal?: AbortSignal): Promise<Story[]> {
  return fetchJson<Story[]>(`${API_BASE_URL}/${feedType}?page=${page}`, signal);
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
  return fetchJson<PollResult>(`${API_BASE_URL}/item/${id}`, signal);
}

export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
  const story = await fetchJson<Story>(`${API_BASE_URL}/item/${id}`, signal);
  if (story.type === 'poll' && story.poll) {
    const poll = await Promise.all(story.poll.map((_, i) => fetchPollContent(story.id + i + 1, signal)));
    story.poll = poll;
    story.poll_votes_count = poll.reduce((total, result) => total + result.points, 0);
  }
  return story;
}

export async function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
  const user = await fetchJson<User | null>(`${USER_API_BASE_URL}/user/${encodeURIComponent(id)}.json`, signal);
  if (!user) {
    throw new Error(`User ${id} not found`);
  }
  return user;
}
