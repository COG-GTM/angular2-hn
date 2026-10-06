// Ported from src/app/shared/services/hackernews-api.service.ts
import type { FeedType, PollResult, Story, User } from '../types';

export const BASE_URL = 'https://node-hnapi.herokuapp.com';
// node-hnapi's /user/:id endpoint returns 404 for every user, so users come from the HNPWA API (same response shape).
export const USER_BASE_URL = 'https://api.hnpwa.com/v0';

export class HNApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = 'HNApiError';
  }
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new HNApiError(`Request failed: ${res.status} ${url}`, res.status);
  }
  return (await res.json()) as T;
}

export function fetchFeed(feedType: FeedType, page: number, signal?: AbortSignal): Promise<Story[]> {
  return getJson<Story[]>(`${BASE_URL}/${feedType}?page=${page}`, signal);
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
  return getJson<PollResult>(`${BASE_URL}/item/${id}`, signal);
}

/** Fetches an item with its comment tree. For polls, poll options (ids item.id+1..n) are resolved and totalled. */
export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
  const story = await getJson<Story>(`${BASE_URL}/item/${id}`, signal);
  if (!story) {
    throw new HNApiError(`Item ${id} not found`, 404);
  }
  if (story.type === 'poll' && story.poll?.length) {
    const results = await Promise.all(story.poll.map((_, i) => fetchPollContent(story.id + i + 1, signal)));
    story.poll = results;
    story.poll_votes_count = results.reduce((sum, r) => sum + (r.points ?? 0), 0);
  }
  return story;
}

export async function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
  const user = await getJson<User | null>(`${USER_BASE_URL}/user/${encodeURIComponent(id)}.json`, signal);
  // HNPWA answers 200 with a `null` body for unknown users.
  if (!user) {
    throw new HNApiError(`User ${id} not found`, 404);
  }
  return user;
}
