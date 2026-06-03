import type { Comment } from './Comment';
import type { FeedType } from './FeedType';
import type { PollResult } from './PollResult';

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
  content: string;
  poll: PollResult[];
  poll_votes_count: number;
  deleted: boolean;
  dead: boolean;
}
