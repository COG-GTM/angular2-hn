interface FeedProps {
  feedType: string;
}

// Placeholder — implemented in the feed migration slice.
export default function Feed({ feedType }: FeedProps) {
  return <div className="main-content">{feedType}</div>;
}
