// Models ported from src/app/shared/models (Angular). Field names match the node-hnapi JSON.

export type FeedType = 'news' | 'newest' | 'show' | 'ask' | 'jobs';

export const FEED_TYPES: readonly FeedType[] = ['news', 'newest', 'show', 'ask', 'jobs'];

/** Items per feed page returned by node-hnapi; "More ›" is shown only when a page is full. */
export const PAGE_SIZE = 30;

export type ItemType = 'link' | 'ask' | 'job' | 'poll' | 'comment' | 'story';

export interface PollResult {
  points: number;
  content: string;
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

export interface Story {
  id: number;
  title: string;
  points: number | null;
  user: string | null;
  time: number;
  time_ago: string;
  type: ItemType;
  url: string;
  domain?: string;
  content?: string;
  comments?: Comment[];
  comments_count: number;
  poll?: PollResult[];
  poll_votes_count?: number;
  deleted?: boolean;
  dead?: boolean;
}

export interface User {
  id: string;
  created_time: number;
  created: string;
  karma: number;
  avg?: number;
  about?: string;
}

/** Contract of the data service (port of HackerNewsAPIService). Implemented in ./hackernews.ts. */
export interface HackerNewsApi {
  fetchFeed(feedType: FeedType, page: number, signal?: AbortSignal): Promise<Story[]>;
  fetchItemContent(id: number, signal?: AbortSignal): Promise<Story>;
  fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult>;
  fetchUser(id: string, signal?: AbortSignal): Promise<User>;
}
