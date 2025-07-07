import { Comment } from './comment';
import { FeedType } from './feed-type.type';
import { PollResult } from './poll-result';

export class Story {
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

  constructor() {
    this.id = 0;
    this.title = '';
    this.points = 0;
    this.user = '';
    this.time = 0;
    this.time_ago = 0;
    this.type = 'story';
    this.url = '';
    this.domain = '';
    this.comments = [];
    this.comments_count = 0;
    this.poll = [];
    this.poll_votes_count = 0;
    this.deleted = false;
    this.dead = false;
  }
}
