import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

const baseUrl = 'https://node-hnapi.herokuapp.com';

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request to ${url} failed with status ${res.status}`);
  }
  return (await res.json()) as T;
}

export function fetchFeed(feedType: string, page: number): Promise<Story[]> {
  return getJson<Story[]>(`${baseUrl}/${feedType}?page=${page}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
  const story = await getJson<Story>(`${baseUrl}/item/${id}`);

  if (story.type === 'poll') {
    const numberOfPollOptions = story.poll.length;
    story.poll_votes_count = 0;
    for (let i = 1; i <= numberOfPollOptions; i++) {
      const pollResults = await fetchPollContent(story.id + i);
      story.poll[i - 1] = pollResults;
      story.poll_votes_count += pollResults.points;
    }
  }

  return story;
}

export function fetchPollContent(id: number): Promise<PollResult> {
  return getJson<PollResult>(`${baseUrl}/item/${id}`);
}

export function fetchUser(id: string): Promise<User> {
  return getJson<User>(`${baseUrl}/user/${id}`);
}
