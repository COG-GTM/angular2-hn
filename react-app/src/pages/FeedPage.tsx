import { useParams } from 'react-router-dom';
import type { FeedType } from '../models';

// Placeholder: ported from feeds/feed + feeds/item in the feeds PR.
export default function FeedPage({ feedType }: { feedType: FeedType }) {
    const { page = '1' } = useParams();
    return (
        <div className="main-content" data-testid="feed-page">
            {feedType} page {page}
        </div>
    );
}
