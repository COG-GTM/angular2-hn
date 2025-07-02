import { useQuery } from '@tanstack/react-query';
import { hackerNewsAPIService } from '../services/hackernews-api.service';

export const useHackerNewsAPI = () => {
  const fetchFeed = (feedType: string, page: number) => {
    return useQuery({
      queryKey: ['feed', feedType, page],
      queryFn: () => hackerNewsAPIService.fetchFeed(feedType, page),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  const fetchItemContent = (id: number) => {
    return useQuery({
      queryKey: ['item', id],
      queryFn: () => hackerNewsAPIService.fetchItemContent(id),
      enabled: !!id,
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  const fetchUser = (id: string) => {
    return useQuery({
      queryKey: ['user', id],
      queryFn: () => hackerNewsAPIService.fetchUser(id),
      enabled: !!id,
      staleTime: 15 * 60 * 1000, // 15 minutes
    });
  };

  return {
    fetchFeed,
    fetchItemContent,
    fetchUser,
  };
};
