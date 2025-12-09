export interface Story {
  id: number;
  title: string;
  points?: number;
  user?: string;
  url?: string;
  domain?: string;
  time: number;
  time_ago: string;
  comments_count?: number;
  type: 'story' | 'job' | 'poll';
  comments?: Comment[];
  poll?: PollResult[];
  poll_votes_count?: number;
  content?: string;
  deleted?: boolean;
  dead?: boolean;
}

export interface Comment {
  id: number;
  level: number;
  user: string;
  time: number;
  time_ago: string;
  content: string;
  deleted?: boolean;
  comments: Comment[];
}

export interface User {
  id: string;
  karma: number;
  created: string;
  about?: string;
  crated_time?: number;
  avg?: number;
}

export interface PollResult {
  id: number;
  title?: string;
  points: number;
  content?: string;
}

export class HackerNewsAPI {
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
      story.poll_votes_count = 0;
      const pollResults: PollResult[] = [];
      for (let i = 1; i <= story.poll.length; i++) {
        const pollResult = await this.fetchPollContent(story.id + i);
        pollResults.push(pollResult);
        story.poll_votes_count += pollResult.points;
      }
      story.poll = pollResults;
    }

    return story;
  }

  async fetchPollContent(id: number): Promise<PollResult> {
    const response = await fetch(`${this.baseUrl}/item/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch poll ${id}`);
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
