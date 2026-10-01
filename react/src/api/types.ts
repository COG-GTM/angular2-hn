/**
 * Response shapes returned by https://node-hnapi.herokuapp.com.
 * Nullable fields reflect what the API actually sends (e.g. jobs have no
 * `points`/`user`).
 */

export type FeedName = 'news' | 'newest' | 'show' | 'ask' | 'jobs';

export const FEED_NAMES: readonly FeedName[] = ['news', 'newest', 'show', 'ask', 'jobs'];

/** `type` as sent by node-hnapi. Feed entries use `link`/`ask`/`job`; items use `story`/`poll`/`job`/`pollopt`. */
export type ItemType = 'link' | 'ask' | 'story' | 'job' | 'poll' | 'pollopt' | 'comment';

/** An entry in a feed list (`/{feed}?page={n}`). */
export interface Story {
  id: number;
  title: string;
  points: number | null;
  user: string | null;
  time: number;
  time_ago: string;
  comments_count: number;
  type: ItemType;
  /** Absolute URL for links; `item?id=…` for self posts (ask/show/poll). */
  url: string;
  domain?: string;
  deleted?: boolean;
  dead?: boolean;
}

export interface Comment {
  id: number;
  level: number;
  user: string | null;
  time: number;
  time_ago: string;
  content: string;
  comments: Comment[];
  deleted?: boolean;
  dead?: boolean;
}

/**
 * A poll choice. node-hnapi embeds `{ item, points }` in the poll item; the
 * client resolves each choice via `/item/{id}` (as the Angular service did)
 * which adds `content`.
 */
export interface PollOption {
  points: number;
  content?: string;
  item?: string;
}

/** Full item (`/item/{id}`). */
export interface Item extends Story {
  content?: string;
  comments: Comment[];
  level?: number;
  poll?: PollOption[];
  /** Sum of poll option points; computed client-side for `type === 'poll'`. */
  poll_votes_count?: number;
}

export interface User {
  id: string;
  created_time: number;
  /** Human-readable relative creation date, e.g. "18 years ago". */
  created: string;
  karma: number;
  avg?: number | null;
  about?: string;
  /** Submission ids (only provided by the official HN API fallback). */
  submitted?: number[];
}
