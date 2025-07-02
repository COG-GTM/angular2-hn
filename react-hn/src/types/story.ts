export interface Story {
  id: number;
  title: string;
  url?: string;
  points: number;
  user: string;
  time_ago: string;
  comments_count: number;
  type: string;
  content?: string;
  comments?: Comment[];
  poll?: any[];
  poll_votes_count?: number;
}

export interface Comment {
  id: number;
  user: string;
  time_ago: string;
  content: string;
  comments?: Comment[];
  level: number;
}

export interface User {
  id: string;
  created: string;
  karma: number;
  about?: string;
  submitted?: number[];
}

export interface PollResult {
  id: number;
  points: number;
  text: string;
}
