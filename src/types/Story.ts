import { Comment } from './Comment';
import { PollResult } from './PollResult';

export interface Story {
  id: number;
  title: string;
  points: number;
  user: string;
  time: number;
  time_ago: string;
  type: 'news' | 'newest' | 'show' | 'ask' | 'jobs' | 'poll' | 'job';
  url: string;
  domain: string;
  content?: string;
  text?: string;
  comments: Comment[];
  comments_count: number;
  poll: PollResult[];
  poll_votes_count: number;
  deleted: boolean;
  dead: boolean;
}
