import { useQuery } from '@tanstack/react-query';

import { fetchUser } from '../shared/api/hackernews';

export function useUser(id: string) {
    return useQuery({
        queryKey: ['user', id],
        queryFn: ({ signal }) => fetchUser(id, signal),
    });
}
