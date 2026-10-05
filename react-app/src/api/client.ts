import type { FeedName, PollResult, Story, User } from '../models';

export const HN_API_BASE_URL = 'https://node-hnapi.herokuapp.com';
// node-hnapi's /user endpoint now returns 404, so user profiles come from the HNPWA API (same response shape).
export const HN_USER_API_BASE_URL = 'https://api.hnpwa.com/v0';

export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, url: string) {
    super(`Request to ${url} failed with status ${status}`);
    this.name = 'HttpError';
    this.status = status;
  }
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new HttpError(res.status, url);
  }
  return (await res.json()) as T;
}

export function fetchFeed(feedType: FeedName, page: number, signal?: AbortSignal): Promise<Story[]> {
  return getJson<Story[]>(`${HN_API_BASE_URL}/${feedType}?page=${page}`, signal);
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
  return getJson<PollResult>(`${HN_API_BASE_URL}/item/${id}`, signal);
}

/**
 * Fetches a story with its comment tree. For polls, each option is a separate item with id
 * `story.id + n`; those are fetched and `poll_votes_count` is summed, as in the Angular service.
 */
export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
  const story = await getJson<Story>(`${HN_API_BASE_URL}/item/${id}`, signal);
  if (story.type === 'poll' && story.poll) {
    const options = story.poll;
    const results = await Promise.allSettled(options.map((_, i) => fetchPollContent(story.id + i + 1, signal)));
    const poll = results.map((result, i) => (result.status === 'fulfilled' ? result.value : options[i]));
    story.poll = poll;
    story.poll_votes_count = results.reduce(
      (total, result) => (result.status === 'fulfilled' ? total + result.value.points : total),
      0
    );
  }
  return story;
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
  return getJson<User>(`${HN_USER_API_BASE_URL}/user/${encodeURIComponent(id)}.json`, signal);
}
