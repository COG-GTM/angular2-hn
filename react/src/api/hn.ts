import type { FeedName, Item, PollOption, Story, User } from './types';

export const HN_API_BASE_URL = 'https://node-hnapi.herokuapp.com';
export const HN_FIREBASE_BASE_URL = 'https://hacker-news.firebaseio.com/v0';

export class HttpError extends Error {
  readonly status: number;
  readonly url: string;

  constructor(status: number, url: string) {
    super(`Request to ${url} failed with status ${status}`);
    this.name = 'HttpError';
    this.status = status;
    this.url = url;
  }
}

export interface RequestOptions {
  signal?: AbortSignal;
}

async function getJson<T>(url: string, { signal }: RequestOptions = {}): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new HttpError(res.status, url);
  }
  return (await res.json()) as T;
}

export function fetchFeed(feed: FeedName, page: number, options?: RequestOptions): Promise<Story[]> {
  return getJson<Story[]>(`${HN_API_BASE_URL}/${feed}?page=${page}`, options);
}

/**
 * Fetches an item with its comment tree. For polls, each choice is resolved
 * from `/item/{pollId + n}` and `poll_votes_count` is summed, matching
 * `HackerNewsAPIService.fetchItemContent`.
 */
export async function fetchItem(id: number, options?: RequestOptions): Promise<Item> {
  const item = await getJson<Item>(`${HN_API_BASE_URL}/item/${id}`, options);
  if (item.type === 'poll' && item.poll) {
    const poll = await Promise.all(
      item.poll.map((_, i) => getJson<PollOption>(`${HN_API_BASE_URL}/item/${item.id + i + 1}`, options)),
    );
    return { ...item, poll, poll_votes_count: poll.reduce((sum, option) => sum + option.points, 0) };
  }
  return item;
}

interface FirebaseUser {
  id: string;
  created: number;
  karma: number;
  about?: string;
  submitted?: number[];
}

function relativeYears(createdSeconds: number, now: number): string {
  const days = Math.floor((now / 1000 - createdSeconds) / 86400);
  if (days >= 365) {
    const years = Math.floor(days / 365);
    return `${years} year${years === 1 ? '' : 's'} ago`;
  }
  if (days >= 30) {
    const months = Math.floor(days / 30);
    return `${months} month${months === 1 ? '' : 's'} ago`;
  }
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export function normalizeFirebaseUser(user: FirebaseUser, now: number = Date.now()): User {
  return {
    id: user.id,
    created_time: user.created,
    created: relativeYears(user.created, now),
    karma: user.karma,
    about: user.about,
    submitted: user.submitted,
  };
}

/**
 * Fetches a user from node-hnapi. If node-hnapi answers 404 (its `/user`
 * route is currently unavailable), falls back to the official HN API and
 * normalizes the response to the same `User` shape.
 */
export async function fetchUser(id: string, options?: RequestOptions): Promise<User> {
  const encoded = encodeURIComponent(id);
  try {
    return await getJson<User>(`${HN_API_BASE_URL}/user/${encoded}`, options);
  } catch (err) {
    if (!(err instanceof HttpError) || err.status !== 404) {
      throw err;
    }
  }
  const user = await getJson<FirebaseUser | null>(`${HN_FIREBASE_BASE_URL}/user/${encoded}.json`, options);
  if (!user) {
    throw new HttpError(404, `${HN_FIREBASE_BASE_URL}/user/${encoded}.json`);
  }
  return normalizeFirebaseUser(user);
}
