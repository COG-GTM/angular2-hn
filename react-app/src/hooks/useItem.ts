import { useEffect, useState } from 'react';

import { fetchItemContent } from '../services/hackernewsApi';
import type { Story } from '../models';

interface ItemResult {
    id: number;
    item?: Story;
    errorMessage: string;
}

interface ItemState {
    item?: Story;
    errorMessage: string;
}

export function useItem(id: number): ItemState {
    const [result, setResult] = useState<ItemResult>();

    useEffect(() => {
        let cancelled = false;
        window.scrollTo(0, 0);

        fetchItemContent(id)
            .then((data) => {
                if (!cancelled) {
                    setResult({ id, item: data, errorMessage: '' });
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setResult({
                        id,
                        errorMessage: 'Could not load item comments.',
                    });
                }
            });

        return () => {
            cancelled = true;
        };
    }, [id]);

    const current = result && result.id === id ? result : undefined;

    return {
        item: current?.item,
        errorMessage: current?.errorMessage ?? '',
    };
}
