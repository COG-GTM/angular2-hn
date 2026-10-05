/** HN item type, as returned by the API (`story.type`). */
export type FeedType = 'poll' | 'story' | 'job';

/** The feed listings exposed as routes (`/news/:page`, `/newest/:page`, ...). */
export const FEED_NAMES = ['news', 'newest', 'show', 'ask', 'jobs'] as const;
export type FeedName = (typeof FEED_NAMES)[number];

export const STORIES_PER_PAGE = 30;
