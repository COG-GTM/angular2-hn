import type { Comment } from './comment';
import type { FeedType } from './feedType';
import type { PollResult } from './pollResult';

export interface Story {
  id: number;
  title: string;
  points: number;
  user: string;
  time: number;
  time_ago: string;
  type: FeedType;
  url: string;
  domain: string;
  comments: Comment[];
  comments_count: number;
  poll: PollResult[];
  poll_votes_count: number;
  deleted: boolean;
  dead: boolean;
  // The API also returns a `content` field for self/text posts and polls.
  content: string;
  // Present on some item payloads; used by the detail view layout.
  text?: string;
}
