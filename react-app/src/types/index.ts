// Feed type for items
export type FeedType = 'poll' | 'story' | 'job';

// Poll result type
export interface PollResult {
  points: number;
  content: string;
}

// Comment type (recursive)
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

// Story/Item type
export interface Story {
  id: number;
  title: string;
  points: number;
  user: string;
  time: number;
  time_ago: number;
  type: FeedType;
  url: string;
  domain: string;
  comments: Comment[];
  comments_count: number;
  poll: PollResult[];
  poll_votes_count: number;
  deleted: boolean;
  dead: boolean;
}

// User type
export interface User {
  id: string;
  created_time: number;
  created: string;
  karma: number;
  avg: number;
  about: string;
}

// Settings type
export interface Settings {
  showSettings: boolean;
  openLinkInNewTab: boolean;
  theme: 'default' | 'night' | 'amoled';
  titleFontSize: string;
  listSpacing: string;
}

// Feed route types
export type FeedRouteType = 'news' | 'newest' | 'show' | 'ask' | 'jobs';
