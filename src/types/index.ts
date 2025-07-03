export interface Story {
  id: number;
  title: string;
  points?: number;
  user?: string;
  time_ago: string;
  comments_count?: number;
  type: string;
  url?: string;
  domain?: string;
  content?: string;
  comments?: Comment[];
  poll?: PollResult[];
  poll_votes_count?: number;
}

export interface Comment {
  id: number;
  level: number;
  user: string;
  time_ago: string;
  content: string;
  comments: Comment[];
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
  points: number;
  text: string;
}

export interface Settings {
  showSettings: boolean;
  openLinkInNewTab: boolean;
  theme: 'default' | 'night' | 'black';
  titleFontSize: string;
  listSpacing: string;
}

export type FeedType = 'news' | 'newest' | 'show' | 'ask' | 'jobs';
