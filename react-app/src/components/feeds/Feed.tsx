import { useParams } from 'react-router-dom';
import { useFeed } from '../../hooks';
import type { FeedType } from '../../models';

interface FeedProps {
  feedType: FeedType;
}

export function Feed({ feedType }: FeedProps) {
  const { page } = useParams<{ page: string }>();
  const pageNumber = parseInt(page || '1', 10);
  const { data: stories, loading, error } = useFeed(feedType, pageNumber);

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error.message}</div>;
  }

  if (!stories || stories.length === 0) {
    return <div className="empty">No stories found</div>;
  }

  return (
    <div className="feed">
      <ul className="feed-list">
        {stories.map((story) => (
          <li key={story.id} className="feed-item">
            <span className="title">{story.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
