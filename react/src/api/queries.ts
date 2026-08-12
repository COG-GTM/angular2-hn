import { useQuery } from '@tanstack/react-query';

import { fetchFeed, fetchItemContent, fetchUser } from './hackernews';

export function useFeed(feedType: string, page: number) {
    return useQuery({
        queryKey: ['feed', feedType, page],
        queryFn: ({ signal }) => fetchFeed(feedType, page, signal),
    });
}

export function useItem(id: number) {
    return useQuery({
        queryKey: ['item', id],
        queryFn: ({ signal }) => fetchItemContent(id, signal),
        enabled: Number.isFinite(id),
    });
}

export function useUser(id: string) {
    return useQuery({
        queryKey: ['user', id],
        queryFn: ({ signal }) => fetchUser(id, signal),
        enabled: Boolean(id),
    });
}
