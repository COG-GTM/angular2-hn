import { useState, useEffect } from 'react';
import { Story } from '../types/story';
import { fetchFeed } from '../services/hackerNewsApi';

interface UseFeedResult {
    items: Story[] | null;
    error: string;
    loading: boolean;
}

export function useFeed(feedType: string, page: number): UseFeedResult {
    const [items, setItems] = useState<Story[] | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setItems(null);
        setError('');
        setLoading(true);

        fetchFeed(feedType, page)
            .then((data) => {
                if (!cancelled) {
                    setItems(data);
                    setLoading(false);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setError(`Could not load ${feedType} stories.`);
                    setLoading(false);
                }
            });

        return () => { cancelled = true; };
    }, [feedType, page]);

    return { items, error, loading };
}
