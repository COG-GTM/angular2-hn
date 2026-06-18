import type { PollResult, Story, User } from '../types';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return (await response.json()) as T;
}

export function fetchFeed(feedType: string, page: number): Promise<Story[]> {
  return fetchJson<Story[]>(`${BASE_URL}/${feedType}?page=${page}`);
}

export function fetchPollContent(id: number): Promise<PollResult> {
  return fetchJson<PollResult>(`${BASE_URL}/item/${id}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
  const story = await fetchJson<Story>(`${BASE_URL}/item/${id}`);

  if (story.type === 'poll' && Array.isArray(story.poll)) {
    const numberOfPollOptions = story.poll.length;
    story.poll_votes_count = 0;
    const pollResults = await Promise.all(
      Array.from({ length: numberOfPollOptions }, (_, i) =>
        fetchPollContent(story.id + i + 1)
      )
    );
    pollResults.forEach((pollResult, index) => {
      story.poll[index] = pollResult;
      story.poll_votes_count += pollResult.points;
    });
  }

  return story;
}

export function fetchUser(id: string): Promise<User> {
  return fetchJson<User>(`${BASE_URL}/user/${id}`);
}
