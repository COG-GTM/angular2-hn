import type { FeedName } from '../shared/models';
import { useFeed } from '../shared/hooks';

export default function FeedPage({ feedType }: { feedType: FeedName }) {
    const { data, loading, error } = useFeed(feedType, 1);

    if (loading) {
        return <p>Loading {feedType}…</p>;
    }
    if (error) {
        return <p>{error.message}</p>;
    }
    return <p>{data?.length ?? 0} stories loaded for {feedType}.</p>;
}
