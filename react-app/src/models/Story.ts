export type FeedType = 'poll' | 'story' | 'job' | 'ask' | 'show';

export interface Comment {
  id: number;
  user: string;
  time: number;
  time_ago: string;
  content: string;
  comments: Comment[];
  level: number;
}

export interface PollResult {
  id: number;
  title: string;
  points: number;
  time_ago: string;
}

export interface Story {
  id: number;
  title: string;
  points: number | null;
  user: string | null;
  time: number;
  time_ago: string;
  type: FeedType;
  url: string;
  domain: string;
  comments: Comment[];
  comments_count: number;
  poll?: PollResult[];
  poll_votes_count?: number;
  deleted?: boolean;
  dead?: boolean;
}
