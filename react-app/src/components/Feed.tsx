import { useParams } from 'react-router-dom';

interface FeedProps {
  feedType: string;
}

export function Feed({ feedType }: FeedProps) {
  const { page } = useParams<{ page: string }>();
  const currentPage = parseInt(page || '1', 10);

  return (
    <div>
      <h1>{feedType.charAt(0).toUpperCase() + feedType.slice(1)} Feed</h1>
      <p>Page: {currentPage}</p>
      <p>Feed Type: {feedType}</p>
    </div>
  );
}
