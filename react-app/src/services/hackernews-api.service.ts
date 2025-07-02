import axios from 'axios';
import type { Story, User, PollResult } from '../components/shared/models';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

export class HackerNewsAPIService {
  private axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
  });

  async fetchFeed(feedType: string, page: number): Promise<Story[]> {
    const response = await this.axiosInstance.get(`/${feedType}?page=${page}`);
    return response.data;
  }

  async fetchItemContent(id: number): Promise<Story> {
    const response = await this.axiosInstance.get(`/item/${id}`);
    const story: Story = response.data;
    
    if (story.type === 'poll') {
      const numberOfPollOptions = story.poll.length;
      story.poll_votes_count = 0;
      
      for (let i = 1; i <= numberOfPollOptions; i++) {
        try {
          const pollResult = await this.fetchPollContent(story.id + i);
          story.poll[i - 1] = pollResult;
          story.poll_votes_count += pollResult.points;
        } catch (error) {
          console.error(`Failed to fetch poll content for ${story.id + i}:`, error);
        }
      }
    }
    
    return story;
  }

  async fetchPollContent(id: number): Promise<PollResult> {
    const response = await this.axiosInstance.get(`/item/${id}`);
    return response.data;
  }

  async fetchUser(id: string): Promise<User> {
    const response = await this.axiosInstance.get(`/user/${id}`);
    return response.data;
  }
}

export const hackerNewsAPIService = new HackerNewsAPIService();
