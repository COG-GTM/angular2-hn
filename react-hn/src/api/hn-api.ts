import type { Story, User, PollResult } from '../models/types';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

export async function fetchFeed(feedType: string, page: number): Promise<Story[]> {
  const res = await fetch(`${BASE_URL}/${feedType}?page=${page}`);
  if (!res.ok) throw new Error(`Failed to fetch ${feedType} feed`);
  return res.json() as Promise<Story[]>;
}

export async function fetchItemContent(id: number): Promise<Story> {
  const res = await fetch(`${BASE_URL}/item/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch item ${id}`);
  const story = (await res.json()) as Story;

  if (story.type === 'poll' && story.poll) {
    const numberOfPollOptions = story.poll.length;
    story.poll_votes_count = 0;
    const pollPromises = Array.from({ length: numberOfPollOptions }, (_, i) =>
      fetchPollContent(story.id + i + 1)
    );
    const pollResults = await Promise.all(pollPromises);
    pollResults.forEach((result, i) => {
      story.poll![i] = result;
      story.poll_votes_count! += result.points;
    });
  }

  return story;
}

export async function fetchPollContent(id: number): Promise<PollResult> {
  const res = await fetch(`${BASE_URL}/item/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch poll item ${id}`);
  return res.json() as Promise<PollResult>;
}

export async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`${BASE_URL}/user/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch user ${id}`);
  return res.json() as Promise<User>;
}
