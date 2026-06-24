import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

const baseUrl = 'https://node-hnapi.herokuapp.com';

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  return response.json() as Promise<T>;
}

export function fetchFeed(feedType: string, page: number): Promise<Story[]> {
  return fetchJson<Story[]>(`${baseUrl}/${feedType}?page=${page}`);
}

export function fetchPollContent(id: number): Promise<PollResult> {
  return fetchJson<PollResult>(`${baseUrl}/item/${id}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
  const story = await fetchJson<Story>(`${baseUrl}/item/${id}`);

  if (story.type === 'poll' && story.poll) {
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

export function fetchUser(id: string): Promise<User> {
  return fetchJson<User>(`${baseUrl}/user/${id}`);
}
