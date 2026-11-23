import type { FeedType, PollResult, Story, User } from './types';

export const HN_API_URL = 'https://node-hnapi.herokuapp.com';
// node-hnapi no longer serves /user/:id, so profiles come from HNPWA.
export const HNPWA_API_URL = 'https://api.hnpwa.com/v0';

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Request failed: ${res.status} ${url}`);
  return (await res.json()) as T;
}

export function fetchFeed(feedType: FeedType, page: number, signal?: AbortSignal): Promise<Story[]> {
  return getJson<Story[]>(`${HN_API_URL}/${feedType}?page=${page}`, signal);
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
  return getJson<PollResult>(`${HN_API_URL}/item/${id}`, signal);
}

/** Fetches an item; for polls, also loads each option (ids follow the poll id) and totals the votes. */
export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
  const story = await getJson<Story>(`${HN_API_URL}/item/${id}`, signal);
  if (story.type === 'poll' && story.poll) {
    const options = await Promise.all(story.poll.map((_, i) => fetchPollContent(story.id + i + 1, signal)));
    story.poll = options;
    story.poll_votes_count = options.reduce((total, option) => total + option.points, 0);
  }
  return story;
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
  return getJson<User>(`${HNPWA_API_URL}/user/${encodeURIComponent(id)}.json`, signal);
}
