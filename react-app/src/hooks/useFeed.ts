import { useEffect, useState } from 'react';

import { fetchFeed } from '../services/hackernewsApi';
import type { Story } from '../models';

interface FeedResult {
    feedType: string;
    page: number;
    items?: Story[];
    errorMessage: string;
}

interface FeedState {
    items?: Story[];
    errorMessage: string;
}

export function useFeed(feedType: string, page: number): FeedState {
    const [result, setResult] = useState<FeedResult>();

    useEffect(() => {
        let cancelled = false;

        fetchFeed(feedType, page)
            .then((data) => {
                if (cancelled) {
                    return;
                }
                setResult({ feedType, page, items: data, errorMessage: '' });
                window.scrollTo(0, 0);
            })
            .catch(() => {
                if (!cancelled) {
                    setResult({
                        feedType,
                        page,
                        errorMessage: 'Could not load ' + feedType + ' stories.',
                    });
                }
            });

        return () => {
            cancelled = true;
        };
    }, [feedType, page]);

    const current =
        result && result.feedType === feedType && result.page === page
            ? result
            : undefined;

    return {
        items: current?.items,
        errorMessage: current?.errorMessage ?? '',
    };
}
