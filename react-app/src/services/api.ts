import type { Story, User, PollResult } from '../models';

const baseUrl = 'https://node-hnapi.herokuapp.com';

async function get<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  return (await res.json()) as T;
}

export function fetchFeed(
  feedType: string,
  page: number,
  signal?: AbortSignal
): Promise<Story[]> {
  return get<Story[]>(`${baseUrl}/${feedType}?page=${page}`, signal);
}

export function fetchPollContent(
  id: number,
  signal?: AbortSignal
): Promise<PollResult> {
  return get<PollResult>(`${baseUrl}/item/${id}`, signal);
}

export async function fetchItemContent(
  id: number,
  signal?: AbortSignal
): Promise<Story> {
  const story = await get<Story>(`${baseUrl}/item/${id}`, signal);
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
  return get<User>(`${baseUrl}/user/${id}`, signal);
}
