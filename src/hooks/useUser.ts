import { useApi } from './useApi';
import { User } from '../models';

export function useUser(id: string | null) {
  const { data, loading, error } = useApi<User>(id ? `/user/${id}` : null);

  return {
    user: data,
    loading,
    error: error ? `Could not load user ${id}.` : null,
  };
}
