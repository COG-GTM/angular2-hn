import { useState, useEffect } from 'react';
import { Story } from '../types/story';
import { fetchFeed } from '../api/hackernews';

export function useFeed(feedType: string, page: number) {
    const [items, setItems] = useState<Story[] | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();
        setItems(null);
        setError('');
        setLoading(true);

        fetchFeed(feedType, page, controller.signal)
            .then((data) => {
                setItems(data);
                setLoading(false);
            })
            .catch((err) => {
                if (!controller.signal.aborted) {
                    setError(`Could not load ${feedType} stories.`);
                    setLoading(false);
                    console.error(err);
                }
            });

        return () => controller.abort();
    }, [feedType, page]);

    return { items, error, loading };
}
