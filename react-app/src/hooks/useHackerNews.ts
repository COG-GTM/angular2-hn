/**
 * React Query hooks for Hacker News API
 * 
 * These hooks replace the Angular service's RxJS Observable-based approach
 * with React Query for caching, refetching, and loading state management.
 */

import { useQuery } from '@tanstack/react-query';
import { fetchFeed, fetchItemContent, fetchUser } from '../services/api';
import type { Story, User, FeedName } from '../types';

/**
 * Query keys for React Query cache management
 */
export const queryKeys = {
  feed: (feedType: FeedName, page: number) => ['feed', feedType, page] as const,
  item: (id: number) => ['item', id] as const,
  user: (id: string) => ['user', id] as const,
};

/**
 * Hook to fetch a paginated feed of stories
 * Replaces Angular's subscription to HackerNewsAPIService.fetchFeed()
 * 
 * @param feedType - Type of feed (news, newest, show, ask, jobs)
 * @param page - Page number (1-indexed)
 * @returns React Query result with stories data, loading state, and error
 */
export function useFeed(feedType: FeedName, page: number) {
  return useQuery<Story[], Error>({
    queryKey: queryKeys.feed(feedType, page),
    queryFn: () => fetchFeed(feedType, page),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch item content with comments
 * Replaces Angular's subscription to HackerNewsAPIService.fetchItemContent()
 * 
 * @param id - Item ID
 * @returns React Query result with story data, loading state, and error
 */
export function useItem(id: number) {
  return useQuery<Story, Error>({
    queryKey: queryKeys.item(id),
    queryFn: () => fetchItemContent(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: id > 0,
  });
}

/**
 * Hook to fetch user profile
 * Replaces Angular's subscription to HackerNewsAPIService.fetchUser()
 * 
 * @param id - User ID (username)
 * @returns React Query result with user data, loading state, and error
 */
export function useUser(id: string) {
  return useQuery<User, Error>({
    queryKey: queryKeys.user(id),
    queryFn: () => fetchUser(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!id,
  });
}
