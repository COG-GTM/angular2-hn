import { Comment } from './comment';
import { PollResult } from './poll-result';

export interface Story {
  id: number;
  title: string;
  points: number;
  user: string;
  time: number;
  time_ago: string;
  type: string;
  url: string;
  domain: string;
  comments: Comment[];
  comments_count: number;
  content?: string;
  poll?: PollResult[];
  poll_votes_count?: number;
  deleted?: boolean;
  dead?: boolean;
}
