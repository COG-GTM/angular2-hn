/** Angular's `FeedType`: the item kinds a story can be. Renamed to avoid clashing with route feed names. */
export type ItemType = 'poll' | 'story' | 'job';

export type FeedName = 'news' | 'newest' | 'show' | 'ask' | 'jobs';

export const FEED_NAMES: readonly FeedName[] = ['news', 'newest', 'show', 'ask', 'jobs'];
