/**
 * Feed type for Hacker News content categories.
 * Based on the Angular app's feed-type.type.ts
 */
export type FeedType = 'news' | 'newest' | 'show' | 'ask' | 'jobs';

/**
 * Item type for individual story/content types.
 * Used in the Story model to identify the type of content.
 */
export type ItemType = 'poll' | 'story' | 'job';
