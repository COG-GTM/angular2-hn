import { useParams } from 'react-router-dom';
import { useItemDetails } from '../../hooks';

export function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const itemId = id ? parseInt(id, 10) : null;
  const { data: story, loading, error } = useItemDetails(itemId);

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error.message}</div>;
  }

  if (!story) {
    return <div className="empty">Item not found</div>;
  }

  return (
    <div className="item-details">
      <h1 className="title">{story.title}</h1>
      <div className="meta">
        <span className="points">{story.points} points</span>
        <span className="user">by {story.user}</span>
        <span className="time">{story.time_ago}</span>
      </div>
      {story.comments && story.comments.length > 0 && (
        <div className="comments">
          <h2>Comments ({story.comments_count})</h2>
        </div>
      )}
    </div>
  );
}
