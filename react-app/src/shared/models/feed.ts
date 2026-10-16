// Route-level feed names (the `feedType` route data in app.routes.ts), not the story `FeedType`.
export const FEEDS = ['news', 'newest', 'show', 'ask', 'jobs'] as const;
export type Feed = (typeof FEEDS)[number];

export const PAGE_SIZE = 30;
