import { useQuery } from '@tanstack/react-query';

import type { Feed } from '../models';
import { fetchFeed, fetchItemContent, fetchUser } from '../services/hackernews-api';

export const queryKeys = {
    feed: (feedType: Feed, page: number) => ['feed', feedType, page] as const,
    item: (id: number) => ['item', id] as const,
    user: (id: string) => ['user', id] as const,
};

export function useFeed(feedType: Feed, page: number) {
    return useQuery({
        queryKey: queryKeys.feed(feedType, page),
        queryFn: ({ signal }) => fetchFeed(feedType, page, signal),
    });
}

export function useItem(id: number) {
    return useQuery({
        queryKey: queryKeys.item(id),
        queryFn: ({ signal }) => fetchItemContent(id, signal),
        enabled: Number.isFinite(id),
    });
}

export function useUser(id: string) {
    return useQuery({
        queryKey: queryKeys.user(id),
        queryFn: ({ signal }) => fetchUser(id, signal),
        enabled: id.length > 0,
    });
}
