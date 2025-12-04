/**
 * TypeScript type definitions for the Hacker News API
 * Migrated from Angular2-HN application
 */

/**
 * Feed type for categorizing items
 */
export type FeedType = 'poll' | 'story' | 'job';

/**
 * Poll result/option data
 */
export interface PollResult {
  points: number;
  content: string;
}

/**
 * Comment data with recursive structure for nested replies
 */
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

/**
 * Story/item data from the Hacker News API
 */
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

/**
 * User profile data
 */
export interface User {
  id: string;
  crated_time: number; // Note: typo preserved from original API
  created: string;
  karma: number;
  avg: number;
  about: string;
}

/**
 * Application settings
 */
export interface Settings {
  showSettings: boolean;
  openLinkInNewTab: boolean;
  theme: string;
  titleFontSize: string;
  listSpacing: string;
}

/**
 * Feed types available in the application
 */
export type FeedName = 'news' | 'newest' | 'show' | 'ask' | 'jobs';
