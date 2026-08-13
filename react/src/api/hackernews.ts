import { PollResult } from '../models/poll-result';
import { Story } from '../models/story';
import { User } from '../models/user';

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
    const options = await Promise.all(
      story.poll.map((_, index) => fetchPollContent(story.id + index + 1, signal))
    );
    story.poll = options;
    story.poll_votes_count = options.reduce((total, option) => total + option.points, 0);
  }

  return story;
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
  return getJson<User>(`${BASE_URL}/user/${id}`, signal);
}
