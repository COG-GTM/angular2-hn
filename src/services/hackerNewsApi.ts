import type { Story } from '../types/story';
import type { User } from '../types/user';
import type { PollResult } from '../types/poll-result';

const baseUrl = 'https://node-hnapi.herokuapp.com';

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  return (await res.json()) as T;
}

export function fetchFeed(feedType: string, page: number): Promise<Story[]> {
  return getJson<Story[]>(`${baseUrl}/${feedType}?page=${page}`);
}

export function fetchPollContent(id: number): Promise<PollResult> {
  return getJson<PollResult>(`${baseUrl}/item/${id}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
  const story = await getJson<Story>(`${baseUrl}/item/${id}`);

  if (story.type === 'poll' && Array.isArray(story.poll)) {
    const numberOfPollOptions = story.poll.length;
    const pollResults = await Promise.all(
      Array.from({ length: numberOfPollOptions }, (_, i) =>
        fetchPollContent(story.id + i + 1),
      ),
    );

    story.poll_votes_count = 0;
    pollResults.forEach((pollResult, index) => {
      story.poll[index] = pollResult;
      story.poll_votes_count += pollResult.points;
    });
  }

  return story;
}

export function fetchUser(id: string): Promise<User> {
  return getJson<User>(`${baseUrl}/user/${id}`);
}
