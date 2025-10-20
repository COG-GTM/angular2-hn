import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

export const hackerNewsAPI = {
  fetchFeed: async (feedType: string, page: number): Promise<Story[]> => {
    const response = await fetch(`${BASE_URL}/${feedType}?page=${page}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.statusText}`);
    }
    return response.json();
  },

  fetchItemContent: async (id: number): Promise<Story> => {
    const response = await fetch(`${BASE_URL}/item/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch item: ${response.statusText}`);
    }
    const story: Story = await response.json();
    
    if (story.type === 'poll') {
      const numberOfPollOptions = story.poll.length;
      story.poll_votes_count = 0;
      
      for (let i = 1; i <= numberOfPollOptions; i++) {
        try {
          const pollResult = await hackerNewsAPI.fetchPollContent(story.id + i);
          story.poll[i - 1] = pollResult;
          story.poll_votes_count += pollResult.points;
        } catch (error) {
          console.error(`Failed to fetch poll option ${i}:`, error);
        }
      }
    }
    
    return story;
  },

  fetchPollContent: async (id: number): Promise<PollResult> => {
    const response = await fetch(`${BASE_URL}/item/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch poll content: ${response.statusText}`);
    }
    return response.json();
  },

  fetchUser: async (id: string): Promise<User> => {
    const response = await fetch(`${BASE_URL}/user/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }
    return response.json();
  },
};
