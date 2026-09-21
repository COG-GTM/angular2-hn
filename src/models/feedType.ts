export type FeedType = 'news' | 'newest' | 'show' | 'ask' | 'jobs';

export const FEED_TYPES: FeedType[] = ['news', 'newest', 'show', 'ask', 'jobs'];

export function isFeedType(value: string | undefined): value is FeedType {
    return !!value && (FEED_TYPES as string[]).includes(value);
}

export type ItemType = 'poll' | 'story' | 'job';
