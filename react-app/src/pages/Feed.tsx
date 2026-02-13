import { useParams } from 'react-router-dom';

interface FeedProps {
  feedType: string;
}

export default function Feed({ feedType }: FeedProps) {
  const { page } = useParams<{ page: string }>();
  const pageNum = page ? parseInt(page, 10) : 1;

  return (
    <div className="feed">
      <p>Feed: {feedType} | Page: {pageNum}</p>
      <p>Placeholder - will be implemented in next PR</p>
    </div>
  );
}
