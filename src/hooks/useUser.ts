import { useQuery } from '@tanstack/react-query';
import { fetchUser } from '../api/hnApi';

export function useUser(id: string | null) {
    return useQuery({
        queryKey: ['user', id],
        queryFn: ({ signal }) => fetchUser(id as string, signal),
        enabled: !!id,
    });
}
