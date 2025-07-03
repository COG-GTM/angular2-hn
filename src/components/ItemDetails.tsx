import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { hackerNewsAPI } from '../services/hackernews-api';
import type { Story } from '../types';

export const ItemDetails: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [item, setItem] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const itemId = searchParams.get('id');

  useEffect(() => {
    const fetchItem = async () => {
      if (!itemId) {
        setError('No item ID provided');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const story = await hackerNewsAPI.fetchItemContent(parseInt(itemId, 10));
        setItem(story);
      } catch (err) {
        setError('Could not load item details.');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId]);

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!item) {
    return <div className="error-message">Item not found</div>;
  }

  return (
    <div className="item-details">
      <div className="item-header">
        <h1>{item.title}</h1>
        {item.url && (
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="item-url">
            {item.domain}
          </a>
        )}
      </div>
      
      <div className="item-meta">
        {item.points && <span>{item.points} points</span>}
        {item.user && <span> by {item.user}</span>}
        <span> {item.time_ago}</span>
        {item.comments_count !== undefined && (
          <span> | {item.comments_count} comments</span>
        )}
      </div>

      {item.content && (
        <div className="item-content" dangerouslySetInnerHTML={{ __html: item.content }} />
      )}

      {item.comments && item.comments.length > 0 && (
        <div className="comments">
          <h3>Comments</h3>
          {item.comments.map((comment) => (
            <div key={comment.id} className="comment" style={{ marginLeft: `${comment.level * 20}px` }}>
              <div className="comment-meta">
                <span className="comment-user">{comment.user}</span>
                <span className="comment-time"> {comment.time_ago}</span>
              </div>
              <div className="comment-content" dangerouslySetInnerHTML={{ __html: comment.content }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
