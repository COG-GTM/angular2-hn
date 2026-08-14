import type { PollResult, Story, User } from '../models';

export const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, init);
  if (!response.ok) {
    throw new Error(`Request to ${path} failed with status ${response.status}`);
  }
  return (await response.json()) as T;
}

export function fetchFeed(feedType: string, page: number, init?: RequestInit): Promise<Story[]> {
  return getJson<Story[]>(`/${feedType}?page=${page}`, init);
}

export function fetchPollContent(id: number, init?: RequestInit): Promise<PollResult> {
  return getJson<PollResult>(`/item/${id}`, init);
}

export async function fetchItemContent(id: number, init?: RequestInit): Promise<Story> {
  const story = await getJson<Story>(`/item/${id}`, init);
  if (story.type === 'poll') {
    const options = story.poll ?? [];
    const settled = await Promise.allSettled(
      options.map((_, index) => fetchPollContent(story.id + index + 1, init))
    );
    story.poll = options.map((option, index) => {
      const result = settled[index];
      return result.status === 'fulfilled' ? result.value : option;
    });
    story.poll_votes_count = settled.reduce(
      (total, result) => (result.status === 'fulfilled' ? total + result.value.points : total),
      0
    );
  }
  return story;
}

export function fetchUser(id: string, init?: RequestInit): Promise<User> {
  return getJson<User>(`/user/${id}`, init);
}
