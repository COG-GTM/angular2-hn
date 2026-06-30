import './Feed.scss';

interface FeedProps {
    feedType: string;
}

// STUB — implemented by a child session.
export default function Feed({ feedType }: FeedProps) {
    return <div className="main-content">{feedType}</div>;
}
