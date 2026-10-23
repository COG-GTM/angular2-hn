/**
 * Feed names: the route prefixes and node-hnapi feed endpoints (`/news/:page` → `GET /news?page=N`).
 * Angular kept these as route `data.feedType` strings.
 */
export type FeedType = 'news' | 'newest' | 'show' | 'ask' | 'jobs';

export const FEED_TYPES: readonly FeedType[] = ['news', 'newest', 'show', 'ask', 'jobs'];

export function isFeedType(value: unknown): value is FeedType {
    return typeof value === 'string' && (FEED_TYPES as readonly string[]).includes(value);
}

/**
 * Item kind (`Story.type`). Angular's `src/app/shared/models/feed-type.type.ts` named this union `FeedType`
 * (`'poll' | 'story' | 'job'`); node-hnapi also sends `'link'`, `'ask'` and `'comment'`.
 */
export type ItemType = 'poll' | 'story' | 'job' | 'link' | 'ask' | 'comment' | (string & {});
