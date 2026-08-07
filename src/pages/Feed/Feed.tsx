export interface FeedProps {
    feedType: string;
}

// TODO(PR 6): port FeedComponent — fetching, pagination and the error state.
export default function Feed({ feedType }: FeedProps) {
    return <div className="main-content" data-feed-type={feedType}></div>;
}
