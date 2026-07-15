import type { Story } from '../models/story';
import type { User } from '../models/user';
import type { PollResult } from '../models/poll-result';

export const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  return (await res.json()) as T;
}

export function fetchFeed(feedType: string, page: number): Promise<Story[]> {
  return getJson<Story[]>(`${BASE_URL}/${feedType}?page=${page}`);
}

export function fetchPollContent(id: number): Promise<PollResult> {
  return getJson<PollResult>(`${BASE_URL}/item/${id}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
  const story = await getJson<Story>(`${BASE_URL}/item/${id}`);
  if (story.type === 'poll' && Array.isArray(story.poll)) {
    const numberOfPollOptions = story.poll.length;
    story.poll_votes_count = 0;
    const pollResults = await Promise.all(
      Array.from({ length: numberOfPollOptions }, (_, i) =>
        fetchPollContent(story.id + i + 1)
      )
    );
    pollResults.forEach((pollResult, i) => {
      story.poll[i] = pollResult;
      story.poll_votes_count += pollResult.points;
    });
  }
  return story;
}

export function fetchUser(id: string): Promise<User> {
  return getJson<User>(`${BASE_URL}/user/${id}`);
}
