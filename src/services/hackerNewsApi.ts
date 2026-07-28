import type { FeedType } from '../types/feed-type.type';
import type { PollResult } from '../types/poll-result';
import type { Story } from '../types/story';
import type { User } from '../types/user';

export const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request to ${url} failed with status ${response.status}`);
  }
  return (await response.json()) as T;
}

export function fetchFeed(feedType: string, page: number): Promise<Story[]> {
  return getJson<Story[]>(`${BASE_URL}/${feedType}?page=${page}`);
}

export function fetchPollContent(id: number): Promise<PollResult> {
  return getJson<PollResult>(`${BASE_URL}/item/${id}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
  const story = await getJson<Story>(`${BASE_URL}/item/${id}`);

  if (story.type === ('poll' as FeedType) && Array.isArray(story.poll)) {
    const numberOfPollOptions = story.poll.length;
    story.poll_votes_count = 0;
    for (let i = 1; i <= numberOfPollOptions; i++) {
      const pollResult = await fetchPollContent(story.id + i);
      story.poll[i - 1] = pollResult;
      story.poll_votes_count += pollResult.points;
    }
  }

  return story;
}

export function fetchUser(id: string): Promise<User> {
  return getJson<User>(`${BASE_URL}/user/${id}`);
}
