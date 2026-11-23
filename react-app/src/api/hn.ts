import type { FeedType, PollResult, Story, User } from './types';

export const HN_API_URL = 'https://node-hnapi.herokuapp.com';
// node-hnapi no longer serves /user/:id, so profiles come from HNPWA.
export const HNPWA_API_URL = 'https://api.hnpwa.com/v0';

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Request failed: ${res.status} ${url}`);
  const body = await res.json();
  // node-hnapi answers a missing item with 200 `{ error }`; HNPWA answers a missing user with 200 `null`.
  if (body === null || (typeof body === 'object' && 'error' in body)) throw new Error(`Not found: ${url}`);
  return body as T;
}

export function fetchFeed(feedType: FeedType, page: number, signal?: AbortSignal): Promise<Story[]> {
  return getJson<Story[]>(`${HN_API_URL}/${feedType}?page=${page}`, signal);
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
  return getJson<PollResult>(`${HN_API_URL}/item/${id}`, signal);
}

/** Fetches an item. Poll options start from the feed entry (`item` text, points) until `fetchPollResults` loads them. */
export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
  const story = await getJson<Story>(`${HN_API_URL}/item/${id}`, signal);
  if (story.poll) story.poll = story.poll.map(({ points, content, item }) => ({ points, content: content ?? item ?? '' }));
  return story;
}

/** Loads each poll option (ids follow the poll id); like Angular, an option that fails keeps its feed entry. */
export async function fetchPollResults(story: Story, signal?: AbortSignal): Promise<PollResult[]> {
  const poll = story.poll ?? [];
  const results = await Promise.allSettled(poll.map((_, i) => fetchPollContent(story.id + i + 1, signal)));
  return results.map((result, i) => (result.status === 'fulfilled' ? result.value : poll[i]));
}

export function pollVotes(poll: PollResult[]): number {
  return poll.reduce((total, option) => total + option.points, 0);
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
  return getJson<User>(`${HNPWA_API_URL}/user/${encodeURIComponent(id)}.json`, signal);
}
