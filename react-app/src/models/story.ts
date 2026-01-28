import { Comment } from './comment';
import { ItemType } from './feed-type';
import { PollResult } from './poll-result';

/**
 * Story interface for Hacker News stories/items.
 * Based on the Angular app's story.ts model.
 */
export interface Story {
  id: number;
  title: string;
  points: number;
  user: string;
  time: number;
  time_ago: string;
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
