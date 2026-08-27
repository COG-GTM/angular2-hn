import type { PollResult, Story, User, FeedType } from '../types/models';

export const API_BASE_URL = 'https://node-hnapi.herokuapp.com';

async function request<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function fetchFeed(feedType: FeedType, page: number, signal?: AbortSignal): Promise<Story[]> {
  return request<Story[]>(`${API_BASE_URL}/${feedType}?page=${page}`, signal);
}

export async function fetchItem(id: number, signal?: AbortSignal): Promise<Story> {
  const item = await request<Story>(`${API_BASE_URL}/item/${id}`, signal);
  if (item.type !== 'poll' || item.poll.length === 0) {
    return item;
  }
  const poll = await Promise.all(
    item.poll.map((_, index) => fetchPollResult(item.id + index + 1, signal))
  );
  return {
    ...item,
    poll,
    poll_votes_count: poll.reduce((total, option) => total + option.points, 0)
  };
}

export function fetchPollResult(id: number, signal?: AbortSignal): Promise<PollResult> {
  return request<PollResult>(`${API_BASE_URL}/item/${id}`, signal);
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
  return request<User>(`${API_BASE_URL}/user/${encodeURIComponent(id)}`, signal);
}
