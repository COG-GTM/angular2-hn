import { Story } from '../models/story';
import { User } from '../models/user';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

export async function fetchFeed(feedType: string, page: number): Promise<Story[]> {
  const res = await fetch(`${BASE_URL}/${feedType}?page=${page}`);
  if (!res.ok) throw new Error(`Failed to fetch ${feedType}`);
  return res.json();
}

export async function fetchItemContent(id: number): Promise<Story> {
  const res = await fetch(`${BASE_URL}/item/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch item ${id}`);
  const story: Story = await res.json();
  if (story.type === 'poll' && story.poll) {
    const numberOfPollOptions = story.poll.length;
    story.poll_votes_count = 0;
    const pollPromises = [];
    for (let i = 1; i <= numberOfPollOptions; i++) {
      pollPromises.push(
        fetchPollContent(story.id + i).then((pollResult) => {
          story.poll[i - 1] = pollResult;
          story.poll_votes_count += pollResult.points;
        })
      );
    }
    await Promise.all(pollPromises);
  }
  return story;
}

export async function fetchPollContent(id: number): Promise<{ points: number; content: string }> {
  const res = await fetch(`${BASE_URL}/item/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch poll ${id}`);
  return res.json();
}

export async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`${BASE_URL}/user/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch user ${id}`);
  return res.json();
}
