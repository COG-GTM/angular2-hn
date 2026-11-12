import { useQuery } from '@tanstack/react-query';

import { fetchItemContent } from '../shared/api/hackernews';

export function useItem(id: number) {
    return useQuery({
        queryKey: ['item', id],
        queryFn: ({ signal }) => fetchItemContent(id, signal),
    });
}
