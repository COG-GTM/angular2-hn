import type { PollResult, Story, User } from '../models';

const baseUrl = 'https://node-hnapi.herokuapp.com';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request to ${url} failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchFeed(feedType: string, page: number): Promise<Story[]> {
  return fetchJson<Story[]>(`${baseUrl}/${feedType}?page=${page}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
  const story = await fetchJson<Story>(`${baseUrl}/item/${id}`);
  if (story.type === 'poll') {
    const pollResults = await Promise.all(
      story.poll.map((_, index) => fetchPollContent(story.id + index + 1))
    );
    pollResults.forEach((pollResult, index) => {
      story.poll[index] = pollResult;
    });
    story.poll_votes_count = pollResults.reduce((sum, pollResult) => sum + pollResult.points, 0);
  }
  return story;
}

export async function fetchPollContent(id: number): Promise<PollResult> {
  return fetchJson<PollResult>(`${baseUrl}/item/${id}`);
}

export async function fetchUser(id: string): Promise<User> {
  return fetchJson<User>(`${baseUrl}/user/${id}`);
}
