import { useParams } from 'react-router-dom';
import { useItemContent } from '../hooks/useHackerNews';

/**
 * ItemDetails component - placeholder for Phase 2 migration
 * This will replace Angular's ItemDetailsComponent
 */
function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const itemId = parseInt(id || '0', 10);

  const { data: item, isLoading, error } = useItemContent(itemId);

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
        <p>Error loading item. Please try again.</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="error-message">
        <p>Item not found.</p>
      </div>
    );
  }

  return (
    <div className="item-details">
      <h1>{item.title}</h1>
      {item.url && (
        <a href={item.url} target="_blank" rel="noopener noreferrer">
          {item.domain}
        </a>
      )}
      {item.content && (
        <div
          className="item-content"
          dangerouslySetInnerHTML={{ __html: item.content }}
        />
      )}
      <div className="item-meta">
        {item.points && <span>{item.points} points</span>}
        {item.user && <span> by {item.user}</span>}
        <span> {item.time_ago}</span>
        <span> | {item.comments_count} comments</span>
      </div>
    </div>
  );
}

export default ItemDetails;
