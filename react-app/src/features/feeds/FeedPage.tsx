import { useParams } from 'react-router-dom';

import type { FeedType } from '../../types';

export interface FeedPageProps {
    feedType: FeedType;
}

/** PLACEHOLDER (Phase 2 replaces): port of src/app/feeds/feed. Rendered at `/{feedType}/:page`. */
export function FeedPage({ feedType }: FeedPageProps) {
    const { page } = useParams();
    return <div data-testid="feed-page-placeholder">{`${feedType}/${page}`}</div>;
}
