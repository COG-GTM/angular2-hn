import { useState, useEffect } from 'react';
import { Story } from '../models/story';

const BASE_URL = 'https://node-hnapi.herokuapp.com';

export function useFeed(feedType: string, page: number) {
    const [items, setItems] = useState<Story[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setItems(null);
        setError(null);
        const controller = new AbortController();

        fetch(`${BASE_URL}/${feedType}?page=${page}`, { signal: controller.signal })
            .then((res) => res.json())
            .then((data: Story[]) => {
                setItems(data);
            })
            .catch((err) => {
                if (err.name !== 'AbortError') {
                    setError('Could not load ' + feedType + ' stories.');
                }
            });

        return () => controller.abort();
    }, [feedType, page]);

    return { items, error };
}
