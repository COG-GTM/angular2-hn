import { Story } from '../models/Story';
import { User } from '../models/User';
import { PollResult } from '../models/PollResult';

const baseUrl = 'https://node-hnapi.herokuapp.com';

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function fetchFeed(feedType: string, page: number): Promise<Story[]> {
  return getJson<Story[]>(`${baseUrl}/${feedType}?page=${page}`);
}

export function fetchPollContent(id: number): Promise<PollResult> {
  return getJson<PollResult>(`${baseUrl}/item/${id}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
  const story = await getJson<Story>(`${baseUrl}/item/${id}`);
  if (story.type === 'poll') {
    const numberOfPollOptions = story.poll.length;
    story.poll_votes_count = 0;
    const results = await Promise.all(
      Array.from({ length: numberOfPollOptions }, (_, i) =>
        fetchPollContent(story.id + i + 1)
      )
    );
    results.forEach((pollResults, i) => {
      story.poll[i] = pollResults;
      story.poll_votes_count += pollResults.points;
    });
  }
  return story;
}

export function fetchUser(id: string): Promise<User> {
  return getJson<User>(`${baseUrl}/user/${id}`);
}
