import type { ApiHandler } from '../support/mock-api';

export const FEED_TYPES = ['news', 'newest', 'show', 'ask', 'jobs'] as const;
export type FeedType = (typeof FEED_TYPES)[number];

/** Page 1 is full (30 items → "More" shown); page 2 is partial (→ no "More"). */
export const PAGE_SIZES: Record<number, number> = { 1: 30, 2: 7 };

const FEED_ID_BASE: Record<FeedType, number> = { news: 1000, newest: 2000, show: 3000, ask: 4000, jobs: 5000 };

export function feedStoryId(feedType: FeedType, page: number, index: number): number {
    return FEED_ID_BASE[feedType] + (page - 1) * 30 + index + 1;
}

export function feedStoryTitle(feedType: FeedType, page: number, index: number): string {
    return `${feedType} story p${page} #${index + 1}`;
}

export function makeFeedPage(feedType: FeedType, page: number) {
    const isJob = feedType === 'jobs';
    const isAsk = feedType === 'ask';
    return Array.from({ length: PAGE_SIZES[page] ?? 0 }, (_, index) => {
        const id = feedStoryId(feedType, page, index);
        return {
            id,
            title: feedStoryTitle(feedType, page, index),
            points: isJob ? null : 50 + index,
            user: isJob ? null : `user${id}`,
            time: 1_700_000_000 - id,
            time_ago: `${index + 1} hours ago`,
            comments_count: isJob ? 0 : index,
            type: isJob ? 'job' : isAsk ? 'ask' : 'link',
            url: isAsk ? `item?id=${id}` : `https://example.com/${feedType}/${id}`,
            domain: isAsk ? undefined : 'example.com',
        };
    });
}

export function makeItem(id: number) {
    return {
        id,
        title: `Item ${id}`,
        points: 10,
        user: 'pg',
        time: 1_700_000_000,
        time_ago: '1 hour ago',
        type: 'link',
        url: `https://example.com/${id}`,
        domain: 'example.com',
        content: '',
        comments: [],
        comments_count: 0,
    };
}

export const feedHandlers: Record<string, ApiHandler> = {
    ...Object.fromEntries(
        FEED_TYPES.map((feedType) => [
            `/${feedType}`,
            (url: URL) => makeFeedPage(feedType, Number(url.searchParams.get('page') ?? '1')),
        ])
    ),
    '/item/': (url: URL) => makeItem(Number(url.pathname.split('/').pop())),
};
