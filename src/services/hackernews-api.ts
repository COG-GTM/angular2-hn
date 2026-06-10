import type { Story } from '../models/story';
import type { User } from '../models/user';
import type { PollResult } from '../models/poll-result';

const baseUrl = 'https://node-hnapi.herokuapp.com';

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  return res.json() as Promise<T>;
}

export function fetchFeed(feedType: string, page: number): Promise<Story[]> {
  return getJson<Story[]>(`${baseUrl}/${feedType}?page=${page}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
  const story = await getJson<Story>(`${baseUrl}/item/${id}`);

  if (story.type === 'poll') {
    const numberOfPollOptions = story.poll.length;
    story.poll_votes_count = 0;
    const results = await Promise.all(
      Array.from({ length: numberOfPollOptions }, (_, i) =>
        fetchPollContent(story.id + i + 1),
      ),
    );
    results.forEach((pollResult, i) => {
      story.poll[i] = pollResult;
      story.poll_votes_count += pollResult.points;
    });
  }

  return story;
}

export function fetchPollContent(id: number): Promise<PollResult> {
  return getJson<PollResult>(`${baseUrl}/item/${id}`);
}

export function fetchUser(id: string): Promise<User> {
  return getJson<User>(`${baseUrl}/user/${id}`);
}
