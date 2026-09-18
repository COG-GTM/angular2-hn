import type { PollResult } from '../models/poll-result';
import type { Story } from '../models/story';
import type { User } from '../models/user';

export const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return (await response.json()) as T;
}

export function fetchFeed(feedType: string, page: number, signal?: AbortSignal): Promise<Story[]> {
  return getJson<Story[]>(`${BASE_URL}/${feedType}?page=${page}`, signal);
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
  return getJson<PollResult>(`${BASE_URL}/item/${id}`, signal);
}

export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
  const story = await getJson<Story>(`${BASE_URL}/item/${id}`, signal);

  if (story.type === 'poll' && story.poll) {
    const numberOfPollOptions = story.poll.length;
    story.poll_votes_count = 0;
    for (let i = 1; i <= numberOfPollOptions; i++) {
      const pollResult = await fetchPollContent(story.id + i, signal);
      story.poll[i - 1] = pollResult;
      story.poll_votes_count += pollResult.points;
    }
  }

  return story;
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
  return getJson<User>(`${BASE_URL}/user/${id}`, signal);
}
