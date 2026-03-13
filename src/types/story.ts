import { Comment } from './comment';
import { PollResult } from './pollResult';
import { FeedType } from './feedType';

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
  content: string;
  deleted: boolean;
  dead: boolean;
}
