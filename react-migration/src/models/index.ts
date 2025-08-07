export interface Story {
  id: number;
  title: string;
  url?: string;
  domain?: string;
  points: number;
  user: string;
  time_ago: string;
  comments_count: number;
  type: string;
  content?: string;
  comments?: Comment[];
  poll?: PollResult[];
  poll_votes_count?: number;
}

export interface Comment {
  id: number;
  user: string;
  time_ago: string;
  content: string;
  comments: Comment[];
  level: number;
}

export interface User {
  id: string;
  created: string;
  karma: number;
  about?: string;
  submitted?: number[];
}

export interface PollResult {
  id: number;
  title: string;
  points: number;
}

export interface Settings {
  showSettings: boolean;
  openLinkInNewTab: boolean;
  theme: string;
  titleFontSize: string;
  listSpacing: string;
}

export type FeedType = 'news' | 'newest' | 'show' | 'ask' | 'jobs';
