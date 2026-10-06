import { useParams } from 'react-router-dom';
import type { FeedName } from '../shared/models/feed-type';

export interface FeedProps {
    feedType: FeedName;
}

// Placeholder route target; the feed list is implemented in migration phase 3.
export default function Feed({ feedType }: FeedProps) {
    const { page = '1' } = useParams();
    return (
        <div className="main-content" data-testid="feed" data-feed-type={feedType} data-page={page}>
            <p>
                {feedType} — page {page}
            </p>
        </div>
    );
}
