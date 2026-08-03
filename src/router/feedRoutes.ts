import type { FeedName } from '../shared/models/feed-name.type';

export interface FeedRouteConfig {
    path: string;
    feedType: FeedName;
}

export const feedRouteConfigs: FeedRouteConfig[] = [
    { path: '/news/:page', feedType: 'news' },
    { path: '/newest/:page', feedType: 'newest' },
    { path: '/show/:page', feedType: 'show' },
    { path: '/ask/:page', feedType: 'ask' },
    { path: '/jobs/:page', feedType: 'jobs' },
];
