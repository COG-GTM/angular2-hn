import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { fetchFeed } from '../shared/api/hackernews';
import type { Feed } from '../shared/models/feed';

export function useFeed(feedType: Feed, page: number) {
    return useQuery({
        queryKey: ['feed', feedType, page],
        queryFn: async ({ signal }) => ({ feedType, page, items: await fetchFeed(feedType, page, signal) }),
        // Like the Angular version, keep the current list on screen until the next page arrives.
        placeholderData: keepPreviousData,
    });
}
