import type { PollResult } from '../models/poll-result';
import type { Story } from '../models/story';
import type { User } from '../models/user';

export const baseUrl = 'https://node-hnapi.herokuapp.com';

async function lazyFetch<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  return (await response.json()) as T;
}

export function fetchFeed(feedType: string, page: number, signal?: AbortSignal): Promise<Story[]> {
  return lazyFetch<Story[]>(`${baseUrl}/${feedType}?page=${page}`, signal);
}

export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
  const story = await lazyFetch<Story>(`${baseUrl}/item/${id}`, signal);

  if (story.type === 'poll') {
    const numberOfPollOptions = story.poll.length;
    story.poll_votes_count = 0;
    const pollResults = await Promise.all(
      Array.from({ length: numberOfPollOptions }, (_, i) => fetchPollContent(story.id + i + 1, signal))
    );
    pollResults.forEach((pollResult, index) => {
      story.poll[index] = pollResult;
      story.poll_votes_count += pollResult.points;
    });
  }

  return story;
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
  return lazyFetch<PollResult>(`${baseUrl}/item/${id}`, signal);
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
  return lazyFetch<User>(`${baseUrl}/user/${id}`, signal);
}
