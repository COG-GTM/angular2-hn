import { Comment } from './Comment';
import { FeedType } from './FeedType';
import { PollResult } from './PollResult';

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
  content?: string;
  text?: string;
}
