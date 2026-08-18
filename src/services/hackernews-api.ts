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
    // A failing option must not prevent the story itself from rendering.
    const pollResults = await Promise.allSettled(
      Array.from({ length: numberOfPollOptions }, (_, i) => fetchPollContent(story.id + i + 1, signal))
    );
    pollResults.forEach((pollResult, index) => {
      if (pollResult.status !== 'fulfilled') {
        return;
      }
      story.poll[index] = pollResult.value;
      story.poll_votes_count += pollResult.value.points;
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
