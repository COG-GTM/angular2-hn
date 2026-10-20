import { useParams } from 'react-router';

import type { FeedType } from '../../shared/models';

export interface FeedListProps {
    feedType: FeedType;
}

/** Placeholder — Feeds child ports Angular `feeds/feed`. Reads `:page`. */
export function FeedList({ feedType }: FeedListProps) {
    const { page } = useParams<{ page: string }>();
    return (
        <div className="placeholder" data-testid="feed-list">
            FeedList placeholder: {feedType} page {page}
        </div>
    );
}
