import { useParams } from 'react-router-dom';

import type { FeedType } from '../shared/models';
import './Feed.scss';

interface FeedProps {
    feedType: FeedType;
}

/**
 * Foundation placeholder for the `/news|newest|show|ask|jobs/:page` routes.
 * Track A replaces this with the ported `FeedComponent` (list + pagination) and `Item` row.
 */
export function Feed({ feedType }: FeedProps) {
    const { page } = useParams<{ page: string }>();
    const pageNum = page ? Number(page) : 1;

    return (
        <div className="app-feed">
            <div className="main-content">
                <p style={{ padding: '0 40px' }}>
                    Feed <strong>{feedType}</strong>, page {pageNum} — coming in Track A.
                </p>
            </div>
        </div>
    );
}
