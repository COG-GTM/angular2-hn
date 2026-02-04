// Story type - equivalent to Angular's Story model
export interface Story {
  id: number;
  title: string;
  points?: number;
  user?: string;
  time: number;
  time_ago: string;
  comments_count: number;
  type: 'story' | 'job' | 'poll' | 'comment';
  url?: string;
  domain?: string;
  comments?: Comment[];
  content?: string;
  poll?: PollResult[];
  poll_votes_count?: number;
}

// Comment type - equivalent to Angular's Comment model
export interface Comment {
  id: number;
  user: string;
  time: number;
  time_ago: string;
  content: string;
  comments: Comment[];
  level: number;
  open?: boolean;
}

// User type - equivalent to Angular's User model
export interface User {
  id: string;
  created: string;
  karma: number;
  about?: string;
}

// PollResult type - equivalent to Angular's PollResult model
export interface PollResult {
  id: number;
  title: string;
  points: number;
}

// Feed type - equivalent to Angular's FeedType
export type FeedType = 'news' | 'newest' | 'show' | 'ask' | 'jobs';
