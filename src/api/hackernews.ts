import { PollResult } from '../types/poll-result';
import { Story } from '../types/story';
import { User } from '../types/user';

// Plain async data layer replacing Angular's HackerNewsAPIService.
// Uses the native fetch API; every request accepts an optional AbortSignal so
// callers can cancel in-flight requests (e.g. on unmount), mirroring the old
// RxJS cancel-token behaviour in `lazyFetch`.
export const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  return (await response.json()) as T;
}

export function fetchFeed(
  feedType: string,
  page: number,
  signal?: AbortSignal,
): Promise<Story[]> {
  return getJson<Story[]>(`${BASE_URL}/${feedType}?page=${page}`, signal);
}

export async function fetchItemContent(
  id: number,
  signal?: AbortSignal,
): Promise<Story> {
  const story = await getJson<Story>(`${BASE_URL}/item/${id}`, signal);

  if (story.type === 'poll' && Array.isArray(story.poll)) {
    const numberOfPollOptions = story.poll.length;
    story.poll_votes_count = 0;

    const pollResults = await Promise.all(
      Array.from({ length: numberOfPollOptions }, (_unused, index) =>
        fetchPollContent(story.id + index + 1, signal),
      ),
    );

    pollResults.forEach((pollResult, index) => {
      story.poll[index] = pollResult;
      story.poll_votes_count += pollResult.points;
    });
  }

  return story;
}

export function fetchPollContent(
  id: number,
  signal?: AbortSignal,
): Promise<PollResult> {
  return getJson<PollResult>(`${BASE_URL}/item/${id}`, signal);
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
  return getJson<User>(`${BASE_URL}/user/${id}`, signal);
}
