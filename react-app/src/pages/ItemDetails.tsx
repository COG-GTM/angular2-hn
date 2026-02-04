import { useParams } from 'react-router-dom';
import { useItem } from '../hooks/useHackerNews';

export function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const itemId = parseInt(id || '0', 10);
  
  const { data: item, isLoading, error } = useItem(itemId);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!item) {
    return <div>Item not found</div>;
  }

  return (
    <div>
      <h1>{item.title}</h1>
      <p>
        {item.points} points by {item.user} | {item.comments_count} comments
      </p>
      {item.url && (
        <p>
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            {item.domain}
          </a>
        </p>
      )}
    </div>
  );
}
