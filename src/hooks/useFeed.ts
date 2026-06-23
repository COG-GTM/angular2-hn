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
        setItems(null);
        setError('');
        setLoading(true);

        fetchFeed(feedType, page)
            .then((data) => {
                setItems(data);
                setLoading(false);
            })
            .catch(() => {
                setError(`Could not load ${feedType} stories.`);
                setLoading(false);
            });
    }, [feedType, page]);

    return { items, error, loading };
}
