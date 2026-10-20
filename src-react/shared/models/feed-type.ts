/** Feed (route) types — the Angular `data.feedType` values in `app.routes.ts`. */
export type FeedType = 'news' | 'newest' | 'show' | 'ask' | 'jobs';

export const FEED_TYPES: readonly FeedType[] = ['news', 'newest', 'show', 'ask', 'jobs'];

/**
 * Item `type` values returned by node-hnapi. Angular called this union `FeedType`
 * (`'poll' | 'story' | 'job'`); the API also returns `link`, `comment` and `pollopt`.
 */
export type ItemType = 'poll' | 'story' | 'job' | 'link' | 'comment' | 'pollopt' | 'ask';
