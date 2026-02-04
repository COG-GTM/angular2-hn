import { useParams } from 'react-router-dom';
import { useFeed } from '../hooks/useHackerNews';
import { FeedRouteType } from '../types';

interface FeedProps {
  feedType: FeedRouteType;
}

export function Feed({ feedType }: FeedProps) {
  const { page = '1' } = useParams<{ page: string }>();
  const pageNumber = parseInt(page, 10) || 1;
  
  const { data: stories, isLoading, error } = useFeed(feedType, pageNumber);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!stories || stories.length === 0) {
    return <div>No stories found</div>;
  }

  return (
    <div>
      <h1>{feedType.charAt(0).toUpperCase() + feedType.slice(1)} - Page {pageNumber}</h1>
      <ul>
        {stories.map((story) => (
          <li key={story.id}>
            <a href={story.url || `/item/${story.id}`}>{story.title}</a>
            <span> ({story.points} points by {story.user})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
