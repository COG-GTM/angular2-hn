import { useParams } from 'react-router-dom';

type FeedType = 'news' | 'newest' | 'show' | 'ask' | 'jobs';

interface FeedPageProps {
    feedType: FeedType;
}

export default function FeedPage({ feedType }: FeedPageProps) {
    const { page } = useParams<{ page: string }>();

    return (
        <div>
            <h2>{feedType.charAt(0).toUpperCase() + feedType.slice(1)} Feed</h2>
            <p>Page: {page}</p>
            <p>Feed implementation will be added in subsequent phases.</p>
        </div>
    );
}
