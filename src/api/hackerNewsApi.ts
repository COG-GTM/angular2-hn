import type { FeedType, PollResult, Story, User } from '../models';

export const HN_API_BASE_URL = 'https://node-hnapi.herokuapp.com';

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(HN_API_BASE_URL + path, { signal });
  if (!response.ok) throw new Error(`HN API request failed: ${response.status} ${response.statusText}`);
  return response.json() as Promise<T>;
}
export function fetchFeed(feedType: FeedType, page: number, signal?: AbortSignal) {
  return request<Story[]>(`/${feedType}?page=${page}`, signal);
}
export function fetchPollContent(id: number, signal?: AbortSignal) {
  return request<PollResult>(`/item/${id}`, signal);
}
export async function fetchItemContent(id: number, signal?: AbortSignal) {
  const story = await request<Story>(`/item/${id}`, signal);
  if (story.type === 'poll') {
    story.poll = await Promise.all(story.poll.map((_, index) => fetchPollContent(story.id + index + 1, signal)));
    story.poll_votes_count = story.poll.reduce((sum, option) => sum + option.points, 0);
  }
  return story;
}
export function fetchUser(id: string, signal?: AbortSignal) {
  return request<User>(`/user/${encodeURIComponent(id)}`, signal);
}
