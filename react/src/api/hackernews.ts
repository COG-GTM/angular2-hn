// Port of src/app/shared/services/hackernews-api.service.ts.
// OWNER: Session 2 (data layer). Minimal working version so other pages can render real data;
// Session 2 completes parity (poll option aggregation, error handling, tests).
import type { FeedType, HackerNewsApi, PollResult, Story, User } from './types';

export const API_BASE_URL = 'https://node-hnapi.herokuapp.com';

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, { signal });
  if (!res.ok) throw new Error(`HN API ${path} responded ${res.status}`);
  return (await res.json()) as T;
}

export const hackerNewsApi: HackerNewsApi = {
  fetchFeed: (feedType: FeedType, page: number, signal?: AbortSignal) =>
    getJson<Story[]>(`/${feedType}?page=${page}`, signal),
  fetchItemContent: (id: number, signal?: AbortSignal) => getJson<Story>(`/item/${id}`, signal),
  fetchPollContent: (id: number, signal?: AbortSignal) => getJson<PollResult>(`/item/${id}`, signal),
  fetchUser: (id: string, signal?: AbortSignal) => getJson<User>(`/user/${id}`, signal),
};
