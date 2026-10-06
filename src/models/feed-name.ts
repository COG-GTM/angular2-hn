export const FEED_NAMES = ['news', 'newest', 'show', 'ask', 'jobs'] as const;

export type FeedName = (typeof FEED_NAMES)[number];

export function isFeedName(value: unknown): value is FeedName {
    return typeof value === 'string' && (FEED_NAMES as readonly string[]).includes(value);
}
