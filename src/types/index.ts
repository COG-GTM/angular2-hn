// TypeScript types mirroring the Angular models in src/app/shared/models/.

// Item type as returned by the Hacker News API (src/app/shared/models/feed-type.type.ts).
export type FeedType = 'poll' | 'story' | 'job';

// Feed categories used by the feed routes (news/newest/show/ask/jobs).
export type FeedCategory = 'news' | 'newest' | 'show' | 'ask' | 'jobs';

// src/app/shared/models/poll-result.ts
export interface PollResult {
  points: number;
  content: string;
}

// src/app/shared/models/comment.ts
export interface Comment {
  id: number;
  level: number;
  user: string;
  time: number;
  time_ago: string;
  content: string;
  deleted: boolean;
  comments: Comment[];
}

// src/app/shared/models/story.ts
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
  // Present on some item responses (rendered via dangerouslySetInnerHTML).
  content?: string;
  text?: string;
}

// src/app/shared/models/user.ts
export interface User {
  id: string;
  crated_time: number;
  created: string;
  karma: number;
  avg: number;
  about: string;
}
