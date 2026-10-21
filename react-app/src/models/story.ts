import type { Comment } from './comment';
import type { PollResult } from './poll-result';

/** Item type as returned by node-hnapi (`link` for regular stories). */
export type ItemType = 'link' | 'story' | 'ask' | 'job' | 'poll' | 'pollopt' | 'comment';

export interface Story {
  id: number;
  title: string;
  points: number | null;
  user: string | null;
  time: number;
  time_ago: string;
  type: ItemType;
  /** Absolute URL for external links; `item?id=…` for self posts. */
  url: string;
  domain?: string;
  /** HTML body for self posts (ask/show text, job descriptions). */
  content?: string;
  comments: Comment[];
  comments_count: number;
  poll?: PollResult[];
  poll_votes_count?: number;
  deleted?: boolean;
  dead?: boolean;
}
