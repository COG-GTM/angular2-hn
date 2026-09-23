import { useParams } from 'react-router-dom';

import { useFeed, type FeedType } from '../api';

interface FeedPageProps {
    feedType: FeedType;
}

/** Placeholder feed page: the ported feed/item components land in their own PRs. */
export function FeedPage({ feedType }: FeedPageProps) {
    const { page } = useParams();
    const pageNum = page ? Number(page) : 1;
    const { data, error, loading, listStart } = useFeed(feedType, pageNum);

    if (loading) {
        return <div role="status">Loading</div>;
    }
    if (error) {
        return <div role="alert">{error}</div>;
    }

    return (
        <ol start={listStart} data-feed-type={feedType}>
            {data?.map((story) => (
                <li key={story.id}>{story.title}</li>
            ))}
        </ol>
    );
}
