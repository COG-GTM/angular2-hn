import { Story, User, PollResult } from '../models';

class HackerNewsAPIService {
  private baseUrl = 'https://node-hnapi.herokuapp.com';

  async fetchFeed(feedType: string, page: number): Promise<Story[]> {
    const response = await fetch(`${this.baseUrl}/${feedType}?page=${page}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${feedType} feed`);
    }
    return response.json();
  }

  async fetchItemContent(id: number): Promise<Story> {
    const response = await fetch(`${this.baseUrl}/item/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch item ${id}`);
    }
    const story: Story = await response.json();
    
    if (story.type === 'poll' && story.poll) {
      let numberOfPollOptions = story.poll.length;
      story.poll_votes_count = 0;
      
      for (let i = 1; i <= numberOfPollOptions; i++) {
        try {
          const pollResult = await this.fetchPollContent(story.id + i);
          story.poll[i - 1] = pollResult;
          story.poll_votes_count += pollResult.points;
        } catch (error) {
          console.error(`Failed to fetch poll option ${story.id + i}:`, error);
        }
      }
    }
    
    return story;
  }

  async fetchPollContent(id: number): Promise<PollResult> {
    const response = await fetch(`${this.baseUrl}/item/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch poll content ${id}`);
    }
    return response.json();
  }

  async fetchUser(id: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}/user/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user ${id}`);
    }
    return response.json();
  }
}

export const hackerNewsApi = new HackerNewsAPIService();
