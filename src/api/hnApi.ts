import type { PollResult, Story, User } from '../types';

// Preserve the existing external API (see src/app/shared/services/hackernews-api.service.ts).
const baseUrl = 'https://node-hnapi.herokuapp.com';

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, signal ? { signal } : undefined);
  return (await res.json()) as T;
}

// GET /{feedType}?page={page}
export function fetchFeed(feedType: string, page: number, signal?: AbortSignal): Promise<Story[]> {
  return fetchJson<Story[]>(`${baseUrl}/${feedType}?page=${page}`, signal);
}

// GET /item/{id} for a single poll option.
export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
  return fetchJson<PollResult>(`${baseUrl}/item/${id}`, signal);
}

// GET /item/{id}. For polls, additionally fetch each option via /item/{story.id + i}
// (i = 1..poll.length), summing points into poll_votes_count.
export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
  const story = await fetchJson<Story>(`${baseUrl}/item/${id}`, signal);
  if (story.type === 'poll' && story.poll) {
    const numberOfPollOptions = story.poll.length;
    story.poll_votes_count = 0;
    const results = await Promise.all(
      Array.from({ length: numberOfPollOptions }, (_unused, i) =>
        fetchPollContent(story.id + i + 1, signal)
      )
    );
    results.forEach((pollResult, index) => {
      story.poll[index] = pollResult;
      story.poll_votes_count += pollResult.points;
    });
  }
  return story;
}

// GET /user/{id}
export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
  return fetchJson<User>(`${baseUrl}/user/${id}`, signal);
}
