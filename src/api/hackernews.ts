import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

const baseUrl = 'https://node-hnapi.herokuapp.com';

async function fetchJSON<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function fetchFeed(feedType: string, page: number, signal?: AbortSignal): Promise<Story[]> {
  return fetchJSON<Story[]>(`${baseUrl}/${feedType}?page=${page}`, signal);
}

export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
  const story = await fetchJSON<Story>(`${baseUrl}/item/${id}`, signal);
  if (story.type === 'poll' && story.poll) {
    const pollResults = await Promise.all(
      story.poll.map((_, i) => fetchPollContent(story.id + i + 1, signal))
    );
    story.poll = pollResults;
    story.poll_votes_count = pollResults.reduce((total, result) => total + result.points, 0);
  }
  return story;
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
  return fetchJSON<PollResult>(`${baseUrl}/item/${id}`, signal);
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
  return fetchJSON<User>(`${baseUrl}/user/${id}`, signal);
}
