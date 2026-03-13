import { Story } from '../types/story';
import { User } from '../types/user';
import { PollResult } from '../types/pollResult';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

export async function fetchFeed(feedType: string, page: number): Promise<Story[]> {
  const res = await fetch(`${BASE_URL}/${feedType}?page=${page}`);
  if (!res.ok) throw new Error('Failed to fetch feed');
  return res.json();
}

export async function fetchItemContent(id: number): Promise<Story> {
  const res = await fetch(`${BASE_URL}/item/${id}`);
  if (!res.ok) throw new Error('Failed to fetch item');
  const story: Story = await res.json();
  if (story.type === 'poll' && story.poll) {
    const numberOfPollOptions = story.poll.length;
    story.poll_votes_count = 0;
    const pollPromises = [];
    for (let i = 1; i <= numberOfPollOptions; i++) {
      pollPromises.push(
        fetchPollContent(story.id + i).then(pollResult => {
          story.poll[i - 1] = pollResult;
          story.poll_votes_count += pollResult.points;
        })
      );
    }
    await Promise.all(pollPromises);
  }
  return story;
}

export async function fetchPollContent(id: number): Promise<PollResult> {
  const res = await fetch(`${BASE_URL}/item/${id}`);
  if (!res.ok) throw new Error('Failed to fetch poll');
  return res.json();
}

export async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`${BASE_URL}/user/${id}`);
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
}
