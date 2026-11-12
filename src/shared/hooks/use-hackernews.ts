import { useQuery } from '@tanstack/react-query';

import { fetchFeed, fetchItemContent, fetchUser } from '../services/hackernews-api';

export function useFeed(feedType: string, page: number) {
    return useQuery({
        queryKey: ['feed', feedType, page],
        queryFn: ({ signal }) => fetchFeed(feedType, page, signal),
        placeholderData: (previousData, previousQuery) =>
            previousQuery?.queryKey[1] === feedType ? previousData : undefined,
    });
}

export function useItem(id: number) {
    return useQuery({
        queryKey: ['item', id],
        queryFn: ({ signal }) => fetchItemContent(id, signal),
    });
}

export function useUser(id: string) {
    return useQuery({
        queryKey: ['user', id],
        queryFn: ({ signal }) => fetchUser(id, signal),
    });
}
