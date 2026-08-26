import { useParams } from 'react-router-dom';
import { FeedName } from '../models/feed-name.type';

interface FeedProps {
    feedName: FeedName;
}

export default function Feed({ feedName }: FeedProps) {
    const { page } = useParams<'page'>();

    return (
        <main>
            <h2>{feedName}</h2>
            <p>Page {page}</p>
        </main>
    );
}
