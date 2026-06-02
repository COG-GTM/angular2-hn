import type { Story } from '../types/story';
import type { User } from '../types/user';
import type { PollResult } from '../types/pollResult';

const baseUrl = 'https://node-hnapi.herokuapp.com';

async function lazyFetch<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  return (await res.json()) as T;
}

export function fetchFeed(feedType: string, page: number, signal?: AbortSignal): Promise<Story[]> {
  return lazyFetch<Story[]>(`${baseUrl}/${feedType}?page=${page}`, signal);
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
  return lazyFetch<PollResult>(`${baseUrl}/item/${id}`, signal);
}

export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
  const story = await lazyFetch<Story>(`${baseUrl}/item/${id}`, signal);
  if (story.type === 'poll' && Array.isArray(story.poll)) {
    const numberOfPollOptions = story.poll.length;
    story.poll_votes_count = 0;
    const pollResults = await Promise.all(
      Array.from({ length: numberOfPollOptions }, (_unused, i) =>
        fetchPollContent(story.id + i + 1, signal),
      ),
    );
    pollResults.forEach((pollResult, i) => {
      story.poll[i] = pollResult;
      story.poll_votes_count += pollResult.points;
    });
  }
  return story;
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
  return lazyFetch<User>(`${baseUrl}/user/${id}`, signal);
}
