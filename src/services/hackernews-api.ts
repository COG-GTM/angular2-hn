import fetch from 'unfetch';

import type { Story } from '../types/story';
import type { User } from '../types/user';
import type { PollResult } from '../types/poll-result';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

export async function fetchFeed(feedType: string, page: number): Promise<Story[]> {
  const res = await fetch(`${BASE_URL}/${feedType}?page=${page}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch feed: ${res.status}`);
  }
  return res.json();
}

export async function fetchItemContent(id: number): Promise<Story> {
  const res = await fetch(`${BASE_URL}/item/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch item: ${res.status}`);
  }
  const story: Story = await res.json();
  if (story.type === 'poll' && Array.isArray(story.poll)) {
    story.poll_votes_count = 0;
    const pollPromises = story.poll.map(async (_, i) => {
      const pollRes = await fetch(`${BASE_URL}/item/${story.id + i + 1}`);
      if (!pollRes.ok) {
        throw new Error(`Failed to fetch poll item: ${pollRes.status}`);
      }
      const pollResult: PollResult = await pollRes.json();
      story.poll[i] = pollResult;
      story.poll_votes_count += pollResult.points;
    });
    await Promise.all(pollPromises);
  }
  return story;
}

export async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`${BASE_URL}/user/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch user: ${res.status}`);
  }
  return res.json();
}
