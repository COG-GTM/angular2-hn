import { Story, User, PollResult } from '../types/story';
import { lazyFetch } from '../utils/lazyFetch';

export class HackerNewsAPIService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'https://node-hnapi.herokuapp.com';
  }

  async fetchFeed(feedType: string, page: number): Promise<Story[]> {
    return lazyFetch<Story[]>(`${this.baseUrl}/${feedType}?page=${page}`);
  }

  async fetchItemContent(id: number): Promise<Story> {
    const story = await lazyFetch<Story>(`${this.baseUrl}/item/${id}`);
    
    if (story.type === 'poll' && story.poll) {
      const numberOfPollOptions = story.poll.length;
      story.poll_votes_count = 0;
      
      const pollPromises: Promise<PollResult>[] = [];
      for (let i = 1; i <= numberOfPollOptions; i++) {
        pollPromises.push(this.fetchPollContent(story.id + i));
      }
      
      try {
        const pollResults = await Promise.all(pollPromises);
        pollResults.forEach((pollResult, index) => {
          if (story.poll) {
            story.poll[index] = pollResult;
            story.poll_votes_count = (story.poll_votes_count || 0) + pollResult.points;
          }
        });
      } catch (error) {
        console.error('Error fetching poll results:', error);
      }
    }
    
    return story;
  }

  async fetchPollContent(id: number): Promise<PollResult> {
    return lazyFetch<PollResult>(`${this.baseUrl}/item/${id}`);
  }

  async fetchUser(id: string): Promise<User> {
    return lazyFetch<User>(`${this.baseUrl}/user/${id}`);
  }
}

export const hackerNewsApi = new HackerNewsAPIService();
