export interface Comment {
  id: number;
  user: string;
  time: number;
  time_ago: string;
  content: string;
  comments: Comment[];
  level: number;
  deleted?: boolean;
  dead?: boolean;
}

export type FeedType = 'news' | 'newest' | 'show' | 'ask' | 'jobs' | 'job' | 'link' | 'comment' | 'poll' | 'pollopt';

export interface PollResult {
  item: string;
  points: number;
}

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
}

export interface Settings {
  showSettings: boolean;
  openLinkInNewTab: boolean;
  theme: 'default' | 'night' | 'amoledblack';
  titleFontSize: string;
  listSpacing: string;
}
