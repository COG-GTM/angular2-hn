export interface Story {
  id: number;
  title: string;
  points: number;
  user: string;
  time: number;
  time_ago: string;
  type: 'link' | 'ask' | 'job' | 'poll';
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

export interface Comment {
  id: number;
  user: string;
  time_ago: string;
  content: string;
  comments: Comment[];
  deleted?: boolean;
  dead?: boolean;
}

export interface User {
  id: string;
  created_time: number;
  created: string;
  karma: number;
  avg: number;
  about: string;
}

export interface PollResult {
  content: string;
  points: number;
}

export interface Settings {
  showSettings: boolean;
  openLinkInNewTab: boolean;
  theme: 'default' | 'night' | 'amoledblack';
  titleFontSize: string;
  listSpacing: string;
}
