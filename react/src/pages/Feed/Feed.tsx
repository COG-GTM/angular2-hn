import { useParams } from 'react-router-dom';

export function Feed() {
  const { feedType, page } = useParams();
  return (
    <main className="feed">
      <ol data-testid="feed-placeholder">
        {feedType} page {page}
      </ol>
    </main>
  );
}

export default Feed;
