import { Story, User, PollResult } from '../types';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

/**
 * Fetch a feed of stories from the Hacker News API
 * @param feedType - The type of feed (news, newest, show, ask, jobs)
 * @param page - The page number for pagination
 * @returns Promise resolving to an array of Story objects
 */
export async function fetchFeed(feedType: string, page: number): Promise<Story[]> {
  const response = await fetch(`${BASE_URL}/${feedType}?page=${page}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${feedType} feed: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch a single item's content by ID
 * @param id - The item ID
 * @returns Promise resolving to a Story object
 */
export async function fetchItemContent(id: number): Promise<Story> {
  const response = await fetch(`${BASE_URL}/item/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch item ${id}: ${response.statusText}`);
  }
  const story: Story = await response.json();
  
  // Handle poll type items
  if (story.type === 'poll' && story.poll && story.poll.length > 0) {
    const numberOfPollOptions = story.poll.length;
    story.poll_votes_count = 0;
    
    // Fetch poll options in parallel
    const pollPromises = Array.from({ length: numberOfPollOptions }, (_, i) =>
      fetchPollContent(story.id + i + 1)
    );
    
    const pollResults = await Promise.all(pollPromises);
    pollResults.forEach((pollResult, index) => {
      story.poll[index] = pollResult;
      story.poll_votes_count += pollResult.points;
    });
  }
  
  return story;
}

/**
 * Fetch poll content by ID
 * @param id - The poll item ID
 * @returns Promise resolving to a PollResult object
 */
export async function fetchPollContent(id: number): Promise<PollResult> {
  const response = await fetch(`${BASE_URL}/item/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch poll ${id}: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch user data by ID
 * @param id - The user ID (username)
 * @returns Promise resolving to a User object
 */
export async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`${BASE_URL}/user/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch user ${id}: ${response.statusText}`);
  }
  return response.json();
}
