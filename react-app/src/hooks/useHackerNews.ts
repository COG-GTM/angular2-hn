import { useQuery } from '@tanstack/react-query';
import { fetchFeed, fetchItemContent, fetchUser } from '../services/hackernews-api';
import type { FeedType } from '../types';

/**
 * Custom hooks for HackerNews API
 * These replace RxJS observables with React Query for data fetching
 */

export function useFeed(feedType: FeedType, page: number) {
  return useQuery({
    queryKey: ['feed', feedType, page],
    queryFn: () => fetchFeed(feedType, page),
  });
}

export function useItemContent(id: number) {
  return useQuery({
    queryKey: ['item', id],
    queryFn: () => fetchItemContent(id),
    enabled: !!id,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id),
    enabled: !!id,
  });
}
