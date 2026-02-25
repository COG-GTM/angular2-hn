const BASE = 'https://node-hnapi.herokuapp.com';

export interface Story {
  id: number;
  title: string;
  points: number;
  user: string;
  time: number;
  time_ago: string;
  type: string;
  url: string;
  domain: string;
  comments: Comment[];
  comments_count: number;
  content: string;
  poll: PollResult[];
  poll_votes_count: number;
  deleted: boolean;
  dead: boolean;
  text?: string;
}

export interface Comment {
  id: number;
  level: number;
  user: string;
  time: number;
  time_ago: string;
  content: string;
  deleted: boolean;
  comments: Comment[];
}

export interface PollResult {
  points: number;
  content: string;
}

export interface User {
  id: string;
  created_time: number;
  created: string;
  karma: number;
  avg: number;
  about: string;
}

export const fetchFeed = (feedType: string, page: number): Promise<Story[]> =>
  fetch(`${BASE}/${feedType}?page=${page}`).then(r => r.json());

export const fetchItem = async (id: number): Promise<Story> => {
  const story: Story = await fetch(`${BASE}/item/${id}`).then(r => r.json());
  if (story.type === 'poll' && story.poll && story.poll.length > 0) {
    const numberOfPollOptions = story.poll.length;
    const pollResults = await Promise.all(
      Array.from({ length: numberOfPollOptions }, (_, i) =>
        fetch(`${BASE}/item/${story.id + i + 1}`).then(r => r.json()) as Promise<PollResult>
      )
    );
    story.poll = pollResults;
    story.poll_votes_count = pollResults.reduce((sum, p) => sum + (p.points || 0), 0);
  }
  return story;
};

export const fetchUser = (id: string): Promise<User> =>
  fetch(`${BASE}/user/${id}`).then(r => r.json());
