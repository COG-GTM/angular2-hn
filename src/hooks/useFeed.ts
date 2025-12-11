import { useApi } from './useApi';
import { Story } from '../models';

export function useFeed(feedType: string, page: number) {
  const { data, loading, error } = useApi<Story[]>(`/${feedType}?page=${page}`);

  return {
    items: data,
    loading,
    error: error ? `Could not load ${feedType} stories.` : null,
  };
}
