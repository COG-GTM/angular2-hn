export const FEED_NAMES = ['news', 'newest', 'show', 'ask', 'jobs'] as const;

export type FeedName = (typeof FEED_NAMES)[number];
