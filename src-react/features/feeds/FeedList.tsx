import { useParams } from 'react-router-dom';

import type { FeedType } from '../../shared/models';

export interface FeedListProps {
    feedType: FeedType;
}

/** PLACEHOLDER (Phase 2 · Feeds). Route `/:feedType/:page`. */
export function FeedList({ feedType }: FeedListProps) {
    const { page } = useParams<{ page: string }>();
    return (
        <div className="main-content placeholder" data-testid="feed-list-placeholder">
            <h2>FeedList placeholder</h2>
            <p>
                feedType: <strong data-testid="feed-type">{feedType}</strong>, page:{' '}
                <strong data-testid="feed-page">{page}</strong>
            </p>
        </div>
    );
}
