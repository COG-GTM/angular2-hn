/** Feed route names (`src/app/app.routes.ts` `data.feedType`) and node-hnapi feed endpoints. */
export const FEED_TYPES = ['news', 'newest', 'show', 'ask', 'jobs'] as const;

export type FeedType = (typeof FEED_TYPES)[number];

export function isFeedType(value: unknown): value is FeedType {
    return typeof value === 'string' && (FEED_TYPES as readonly string[]).includes(value);
}
