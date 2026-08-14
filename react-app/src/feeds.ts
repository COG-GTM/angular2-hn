export const feeds = ['news', 'newest', 'show', 'ask', 'jobs'] as const;

export type Feed = (typeof feeds)[number];
