export const FEED_TYPES = ['news', 'newest', 'show', 'ask', 'jobs'] as const;

export type FeedType = (typeof FEED_TYPES)[number];
