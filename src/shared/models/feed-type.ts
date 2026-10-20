/** The kind of item returned by the API (Angular: `FeedType`). */
export type ItemType = 'poll' | 'story' | 'job' | 'link' | 'comment';

/** The five feed routes (`/news`, `/newest`, `/show`, `/ask`, `/jobs`). */
export type FeedType = 'news' | 'newest' | 'show' | 'ask' | 'jobs';

export const FEED_TYPES: readonly FeedType[] = ['news', 'newest', 'show', 'ask', 'jobs'];

export const FEED_PAGE_SIZE = 30;
