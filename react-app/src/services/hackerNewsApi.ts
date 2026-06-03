import type { Story } from '../types/Story';
import type { PollResult } from '../types/PollResult';
import type { User } from '../types/User';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

export async function fetchFeed(feedType: string, page: number): Promise<Story[]> {
  const response = await fetch(`${BASE_URL}/${feedType}?page=${page}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch feed: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchItemContent(id: number): Promise<Story> {
  const response = await fetch(`${BASE_URL}/item/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch item: ${response.statusText}`);
  }
  const story: Story = await response.json();

  if (story.type === 'poll' && story.poll) {
    const numberOfPollOptions = story.poll.length;
    const pollPromises: Promise<PollResult>[] = [];
    for (let i = 1; i <= numberOfPollOptions; i++) {
      pollPromises.push(fetchPollContent(story.id + i));
    }
    const pollResults = await Promise.all(pollPromises);
    story.poll = pollResults;
    story.poll_votes_count = pollResults.reduce((sum, p) => sum + p.points, 0);
  }

  return story;
}

async function fetchPollContent(id: number): Promise<PollResult> {
  const response = await fetch(`${BASE_URL}/item/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch poll: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`${BASE_URL}/user/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`);
  }
  return response.json();
}
