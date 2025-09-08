import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchItem } from '../store/slices/itemsSlice';

const ItemDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  
  const itemId = parseInt(id!, 10);
  const itemState = useSelector((state: RootState) => state.items[itemId]);
  const { item, loading, error } = itemState || { item: null, loading: false, error: null };

  useEffect(() => {
    if (itemId) {
      dispatch(fetchItem(itemId));
    }
  }, [dispatch, itemId]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!item) {
    return <div className="error">Item not found</div>;
  }

  return (
    <div className="item-details-page">
      <div className="item-header">
        <h1>{item.title}</h1>
        {item.url && (
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="item-url">
            {item.domain}
          </a>
        )}
        <div className="item-meta">
          {item.points} points by{' '}
          <Link to={`/user/${item.user}`}>{item.user}</Link>{' '}
          {item.time_ago}
        </div>
      </div>
      
      {item.comments && item.comments.length > 0 && (
        <div className="comments-section">
          <h2>{item.comments_count} Comments</h2>
          <div className="comments-list">
            {item.comments.map((comment) => (
              <div key={comment.id} className="comment" style={{ marginLeft: `${comment.level * 20}px` }}>
                <div className="comment-meta">
                  <Link to={`/user/${comment.user}`}>{comment.user}</Link>{' '}
                  {comment.time_ago}
                </div>
                <div 
                  className="comment-content" 
                  dangerouslySetInnerHTML={{ __html: comment.content }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetailsPage;
