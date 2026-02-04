import { useParams } from 'react-router-dom';
import { useFeed } from '../hooks/useHackerNews';
import type { FeedType } from '../types';

interface FeedProps {
  feedType: FeedType;
}

/**
 * Feed component - placeholder for Phase 2 migration
 * This will replace Angular's FeedComponent
 */
function Feed({ feedType }: FeedProps) {
  const { page } = useParams<{ page: string }>();
  const pageNumber = parseInt(page || '1', 10);

  const { data: stories, isLoading, error } = useFeed(feedType, pageNumber);

  if (isLoading) {
    return (
      <div className="app-loader">
        <img className="logo" src="/logo.svg" alt="Loading..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <p>Error loading {feedType} feed. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="feed">
      <h1>{feedType.charAt(0).toUpperCase() + feedType.slice(1)}</h1>
      <p>Page {pageNumber}</p>
      {stories && (
        <ul className="feed-list">
          {stories.map((story) => (
            <li key={story.id} className="feed-item">
              <a href={story.url || `/item/${story.id}`}>{story.title}</a>
              {story.points && <span> ({story.points} points)</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Feed;
