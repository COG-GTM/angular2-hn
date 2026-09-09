import { FeedName } from '../models/feed-name';
import { PollResult } from '../models/poll-result';
import { Story } from '../models/story';
import { User } from '../models/user';

const baseUrl = 'https://node-hnapi.herokuapp.com';

async function getJson<T>(url: string): Promise<T> {
  const res = await window.fetch(url);
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export function fetchFeed(feedType: FeedName, page: number): Promise<Story[]> {
  return getJson<Story[]>(`${baseUrl}/${feedType}?page=${page}`);
}

export function fetchPollContent(id: number): Promise<PollResult> {
  return getJson<PollResult>(`${baseUrl}/item/${id}`);
}

export function fetchUser(id: string): Promise<User> {
  return getJson<User>(`${baseUrl}/user/${id}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
  const story = await getJson<Story>(`${baseUrl}/item/${id}`);
  if (story.type === 'poll') {
    const settled = await Promise.allSettled(
      story.poll.map((_, index) => fetchPollContent(story.id + index + 1)),
    );
    const pollResults = settled.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []));
    story.poll = pollResults;
    story.poll_votes_count = pollResults.reduce((total, result) => total + result.points, 0);
  }
  return story;
}
