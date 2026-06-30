import type { Story } from '../models/story';
import type { User } from '../models/user';
import type { PollResult } from '../models/poll-result';

const baseUrl = 'https://node-hnapi.herokuapp.com';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  return (await res.json()) as T;
}

export function fetchFeed(feedType: string, page: number): Promise<Story[]> {
  return fetchJson<Story[]>(`${baseUrl}/${feedType}?page=${page}`);
}

export function fetchPollContent(id: number): Promise<PollResult> {
  return fetchJson<PollResult>(`${baseUrl}/item/${id}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
  const story = await fetchJson<Story>(`${baseUrl}/item/${id}`);

  if (story.type === 'poll') {
    const numberOfPollOptions = story.poll.length;
    story.poll_votes_count = 0;
    const results = await Promise.all(
      Array.from({ length: numberOfPollOptions }, (_, i) =>
        fetchPollContent(story.id + i + 1),
      ),
    );
    results.forEach((pollResult, index) => {
      story.poll[index] = pollResult;
      story.poll_votes_count += pollResult.points;
    });
  }

  return story;
}

export function fetchUser(id: string): Promise<User> {
  return fetchJson<User>(`${baseUrl}/user/${id}`);
}
