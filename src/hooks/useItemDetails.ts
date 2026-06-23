import { useState, useEffect } from 'react';
import { Story } from '../types/story';
import { fetchItemContent } from '../services/hackerNewsApi';

interface UseItemDetailsResult {
    item: Story | null;
    error: string;
    loading: boolean;
}

export function useItemDetails(id: number): UseItemDetailsResult {
    const [item, setItem] = useState<Story | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setItem(null);
        setError('');
        setLoading(true);

        fetchItemContent(id)
            .then((data) => {
                setItem(data);
                setLoading(false);
            })
            .catch(() => {
                setError('Could not load item comments.');
                setLoading(false);
            });

        window.scrollTo(0, 0);
    }, [id]);

    return { item, error, loading };
}
