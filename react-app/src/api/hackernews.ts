import type { FeedType, PollResult, Story, User } from '../models';

export const HN_API_BASE_URL = 'https://node-hnapi.herokuapp.com';

/** Raw poll option as embedded in a poll item, before it is replaced by its `pollopt` item. */
interface RawPollOption {
  item?: string;
  points: number;
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${HN_API_BASE_URL}${path}`, { signal });
  if (!res.ok) {
    throw new Error(`HN API ${res.status} for ${path}`);
  }
  return (await res.json()) as T;
}

export function fetchFeed(feedType: FeedType, page: number, signal?: AbortSignal): Promise<Story[]> {
  return getJson<Story[]>(`/${feedType}?page=${page}`, signal);
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
  return getJson<PollResult>(`/item/${id}`, signal);
}

/**
 * Fetches an item with its comment tree. For polls, option `i` (1-based) is the item `story.id + i`;
 * each option is replaced by its fetched `pollopt` item and `poll_votes_count` is the sum of the
 * fetched options' points, as in the Angular service. Options that fail to load keep their embedded
 * data and are not counted.
 */
export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
  const story = await getJson<Story>(`/item/${id}`, signal);
  if (story.type !== 'poll' || !story.poll) {
    return story;
  }

  const rawOptions = story.poll as unknown as RawPollOption[];
  const results = await Promise.allSettled(rawOptions.map((_, i) => fetchPollContent(story.id + i + 1, signal)));
  signal?.throwIfAborted();

  let votes = 0;
  const poll = results.map((result, i): PollResult => {
    if (result.status === 'fulfilled') {
      votes += result.value.points;
      return result.value;
    }
    return { content: rawOptions[i].item ?? '', points: rawOptions[i].points };
  });

  return { ...story, poll, poll_votes_count: votes };
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
  return getJson<User>(`/user/${encodeURIComponent(id)}`, signal);
}
