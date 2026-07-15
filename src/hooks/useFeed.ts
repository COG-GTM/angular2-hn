import { useEffect, useState } from 'react';
import { Story } from '../models';
import { fetchFeed } from '../api/hackernews';

export function useFeed(
    feedType: string,
    page: number
): { stories: Story[]; loading: boolean; error: Error | null } {
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(null);
        fetchFeed(feedType, page, controller.signal)
            .then((data) => {
                setStories(data);
                setLoading(false);
            })
            .catch((err: unknown) => {
                setError(err instanceof Error ? err : new Error(String(err)));
                setLoading(false);
            });
        return () => controller.abort();
    }, [feedType, page]);

    return { stories, loading, error };
}
