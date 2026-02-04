import type { Story, User, PollResult, FeedType } from '../types';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

/**
 * HackerNews API Service
 * This replaces the Angular HackerNewsAPIService using plain fetch
 * React Query will handle caching and state management
 */

export async function fetchFeed(feedType: FeedType, page: number): Promise<Story[]> {
  const response = await fetch(`${BASE_URL}/${feedType}?page=${page}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${feedType} feed`);
  }
  return response.json();
}

export async function fetchItemContent(id: number): Promise<Story> {
  const response = await fetch(`${BASE_URL}/item/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch item ${id}`);
  }
  const story: Story = await response.json();

  // Handle poll type items (same logic as Angular service)
  if (story.type === 'poll' && story.poll) {
    const numberOfPollOptions = story.poll.length;
    story.poll_votes_count = 0;

    const pollPromises = Array.from({ length: numberOfPollOptions }, (_, i) =>
      fetchPollContent(story.id + i + 1)
    );

    const pollResults = await Promise.all(pollPromises);
    pollResults.forEach((pollResult, index) => {
      if (story.poll) {
        story.poll[index] = pollResult;
        story.poll_votes_count = (story.poll_votes_count || 0) + pollResult.points;
      }
    });
  }

  return story;
}

export async function fetchPollContent(id: number): Promise<PollResult> {
  const response = await fetch(`${BASE_URL}/item/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch poll ${id}`);
  }
  return response.json();
}

export async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`${BASE_URL}/user/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch user ${id}`);
  }
  return response.json();
}
