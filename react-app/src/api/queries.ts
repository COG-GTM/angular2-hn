import { useQuery } from '@tanstack/react-query';

import type { FeedType } from '../models';
import { fetchFeed, fetchItemContent, fetchUser } from './hackernews';

export const queryKeys = {
    feed: (feedType: FeedType, page: number) => ['feed', feedType, page] as const,
    item: (id: number) => ['item', id] as const,
    user: (id: string) => ['user', id] as const,
};

export function useFeed(feedType: FeedType, page: number) {
    return useQuery({
        queryKey: queryKeys.feed(feedType, page),
        queryFn: ({ signal }) => fetchFeed(feedType, page, signal),
        // Like the Angular FeedComponent, keep the current page on screen while the next page of
        // the same feed loads; switching feeds starts from the loader.
        placeholderData: (previousData, previousQuery) =>
            previousQuery?.queryKey[1] === feedType ? previousData : undefined,
    });
}

export function useItem(id: number) {
    return useQuery({
        queryKey: queryKeys.item(id),
        queryFn: ({ signal }) => fetchItemContent(id, signal),
    });
}

export function useUser(id: string) {
    return useQuery({
        queryKey: queryKeys.user(id),
        queryFn: ({ signal }) => fetchUser(id, signal),
    });
}
