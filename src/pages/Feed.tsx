// PLACEHOLDER — to be implemented in the migration child session for the Feed page.
// Parity target: src/app/feeds/feed/feed.component.{ts,html,scss}
// and src/app/feeds/item/item.component.{ts,html,scss} on the `master` branch.
import { useParams } from 'react-router-dom';

import { Loader } from '../components/Loader/Loader';

interface FeedProps {
    feedType: string;
}

export function Feed({ feedType }: FeedProps) {
    const { page } = useParams<{ page: string }>();
    return (
        <div className="main-content">
            <p>
                Feed placeholder: {feedType} (page {page})
            </p>
            <Loader />
        </div>
    );
}
