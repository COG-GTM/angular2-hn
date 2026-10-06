import { useQuery } from '@tanstack/react-query';
import { fetchFeed } from '../api/hnApi';
import type { FeedName } from '../models';

export function useFeed(feedType: FeedName, page: number) {
    return useQuery({
        queryKey: ['feed', feedType, page],
        queryFn: ({ signal }) => fetchFeed(feedType, page, signal),
    });
}
