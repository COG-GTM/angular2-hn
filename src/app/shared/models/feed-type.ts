export type FeedType = 'poll' | 'story' | 'job';

export const FEEDS = ['news', 'newest', 'show', 'ask', 'jobs'] as const;

export type Feed = (typeof FEEDS)[number];
