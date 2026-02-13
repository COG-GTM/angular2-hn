export interface HNStory {
  id: number;
  title: string;
  url?: string;
  text?: string;
  by: string;
  time: number;
  score: number;
  descendants?: number;
  kids?: number[];
  type: 'story' | 'job' | 'poll';
}

export interface HNComment {
  id: number;
  by: string;
  text: string;
  time: number;
  kids?: number[];
  parent: number;
  type: 'comment';
}

export interface HNUser {
  id: string;
  created: number;
  karma: number;
  about?: string;
  submitted?: number[];
}

export type FeedType = 'top' | 'new' | 'best' | 'ask' | 'show' | 'job';

export interface Settings {
  theme: 'default' | 'dark';
  fontSize: number;
  listSpacing: 'compact' | 'comfortable';
}
