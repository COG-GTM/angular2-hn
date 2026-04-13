import { Story } from '../models/story';
import { User } from '../models/user';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

export async function fetchFeed(feedType: string, page: number): Promise<Story[]> {
  const res = await fetch(`${BASE_URL}/${feedType}?page=${page}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${feedType} feed`);
  }
  return res.json();
}

export async function fetchItemContent(id: number): Promise<Story> {
  const res = await fetch(`${BASE_URL}/item/${id}`);
  if (!res.ok) {
    throw new Error('Failed to fetch item');
  }
  const story: Story = await res.json();
  if (story.type === 'poll' && story.poll) {
    const numberOfPollOptions = story.poll.length;
    story.poll_votes_count = 0;
    for (let i = 1; i <= numberOfPollOptions; i++) {
      const pollRes = await fetch(`${BASE_URL}/item/${story.id + i}`);
      if (pollRes.ok) {
        const pollResult = await pollRes.json();
        story.poll[i - 1] = pollResult;
        story.poll_votes_count += pollResult.points;
      }
    }
  }
  return story;
}

export async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`${BASE_URL}/user/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch user ${id}`);
  }
  return res.json();
}
