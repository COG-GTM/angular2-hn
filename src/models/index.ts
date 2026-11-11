export type ItemType = 'poll' | 'story' | 'job';
export const FEED_TYPES = ['news', 'newest', 'show', 'ask', 'jobs'] as const;
export type FeedType = typeof FEED_TYPES[number];
export type Theme = 'default' | 'night' | 'amoled';

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
export interface PollResult { points: number; content: string }
export interface Story {
  id: number;
  title: string;
  points: number;
  user: string;
  time: number;
  time_ago: number;
  type: ItemType;
  url: string;
  domain: string;
  comments: Comment[];
  comments_count: number;
  poll: PollResult[];
  poll_votes_count: number;
  deleted: boolean;
  dead: boolean;
}
export interface User {
  id: string;
  crated_time: number;
  created: string;
  karma: number;
  avg: number;
  about: string;
}
export interface Settings {
  showSettings: boolean;
  openLinkInNewTab: boolean;
  theme: Theme;
  titleFontSize: string;
  listSpacing: string;
}
