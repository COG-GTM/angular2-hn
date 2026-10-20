import { useQuery } from '@tanstack/react-query';

import type { FeedType } from '../models';
import { fetchFeed, fetchItemContent, fetchUser } from './hackernews-api';

export const hnKeys = {
    all: ['hn'] as const,
    feed: (feedType: FeedType, page: number) => [...hnKeys.all, 'feed', feedType, page] as const,
    item: (id: number) => [...hnKeys.all, 'item', id] as const,
    user: (id: string) => [...hnKeys.all, 'user', id] as const,
};

export function useFeed(feedType: FeedType, page: number) {
    return useQuery({
        queryKey: hnKeys.feed(feedType, page),
        queryFn: ({ signal }) => fetchFeed(feedType, page, signal),
        enabled: Number.isFinite(page) && page > 0,
    });
}

export function useItem(id: number) {
    return useQuery({
        queryKey: hnKeys.item(id),
        queryFn: ({ signal }) => fetchItemContent(id, signal),
        enabled: Number.isFinite(id) && id > 0,
    });
}

export function useUser(id: string) {
    return useQuery({
        queryKey: hnKeys.user(id),
        queryFn: ({ signal }) => fetchUser(id, signal),
        enabled: id.length > 0,
    });
}
