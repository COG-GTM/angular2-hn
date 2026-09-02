import type { FeedName } from '../api/hackernews-api';

export interface FeedRouteDefinition {
    path: FeedName;
    feedType: FeedName;
}

export const FEED_ROUTES: readonly FeedRouteDefinition[] = [
    { path: 'news', feedType: 'news' },
    { path: 'newest', feedType: 'newest' },
    { path: 'show', feedType: 'show' },
    { path: 'ask', feedType: 'ask' },
    { path: 'jobs', feedType: 'jobs' },
];

export const DEFAULT_ROUTE = '/news/1';
