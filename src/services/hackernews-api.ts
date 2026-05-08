import type { PollResult } from '../types/poll-result';
import type { Story } from '../types/story';
import type { User } from '../types/user';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return (await response.json()) as T;
}

export async function fetchFeed(feedType: string, page: number): Promise<Story[]> {
  return getJson<Story[]>(`${BASE_URL}/${feedType}?page=${page}`);
}

export async function fetchPollContent(id: number): Promise<PollResult> {
  return getJson<PollResult>(`${BASE_URL}/item/${id}`);
}

export async function fetchUser(id: string): Promise<User> {
  return getJson<User>(`${BASE_URL}/user/${id}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
  const story = await getJson<Story>(`${BASE_URL}/item/${id}`);

  if (story.type === 'poll' && Array.isArray(story.poll) && story.poll.length > 0) {
    const numberOfPollOptions = story.poll.length;
    const pollResults = await Promise.all(
      Array.from({ length: numberOfPollOptions }, (_, i) => fetchPollContent(story.id + (i + 1)))
    );
    story.poll = pollResults;
    story.poll_votes_count = pollResults.reduce((acc, p) => acc + (p.points || 0), 0);
  }

  return story;
}
