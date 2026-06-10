import unfetch from 'unfetch';

import type { Story, User, PollResult } from '../models';

// Use the native fetch when available, falling back to the `unfetch` polyfill
// (mirrors the Angular app's use of `unfetch`).
const fetchFn: typeof fetch =
  typeof window !== 'undefined' && window.fetch
    ? window.fetch.bind(window)
    : (unfetch as unknown as typeof fetch);

const baseUrl = 'https://node-hnapi.herokuapp.com';

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetchFn(url, { signal });
  return (await res.json()) as T;
}

export function fetchFeed(feedType: string, page: number, signal?: AbortSignal): Promise<Story[]> {
  return getJson<Story[]>(`${baseUrl}/${feedType}?page=${page}`, signal);
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
  return getJson<PollResult>(`${baseUrl}/item/${id}`, signal);
}

export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
  const story = await getJson<Story>(`${baseUrl}/item/${id}`, signal);
  if (story.type === 'poll' && Array.isArray(story.poll)) {
    const numberOfPollOptions = story.poll.length;
    story.poll_votes_count = 0;
    const results = await Promise.all(
      Array.from({ length: numberOfPollOptions }, (_, i) => fetchPollContent(story.id + i + 1, signal)),
    );
    results.forEach((pollResult, index) => {
      story.poll[index] = pollResult;
      story.poll_votes_count += pollResult.points;
    });
  }
  return story;
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
  return getJson<User>(`${baseUrl}/user/${id}`, signal);
}
