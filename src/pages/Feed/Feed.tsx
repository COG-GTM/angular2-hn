import './Feed.scss';

interface FeedProps {
  feedType: string;
}

// TODO(child-session): port FeedComponent (fetch feed, list items, pagination).
export default function Feed({ feedType }: FeedProps) {
  return <div className="main-content" data-feed-type={feedType} />;
}
