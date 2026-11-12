export const FEED_TYPES = ['news', 'newest', 'show', 'ask', 'jobs'] as const;

export type Feed = (typeof FEED_TYPES)[number];
