import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { hackerNewsAPI } from '../services/hackernews-api';
import type { Story, FeedType } from '../types';

interface FeedProps {
  feedType: FeedType;
}

export const Feed: React.FC<FeedProps> = ({ feedType }) => {
  const { page } = useParams<{ page: string }>();
  const [items, setItems] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [listStart, setListStart] = useState(1);

  const pageNum = page ? parseInt(page, 10) : 1;

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      setError('');
      
      try {
        const stories = await hackerNewsAPI.fetchFeed(feedType, pageNum);
        setItems(Array.isArray(stories) ? stories : []);
        setListStart(((pageNum - 1) * 30) + 1);
        window.scrollTo(0, 0);
      } catch (err) {
        setError(`Could not load ${feedType} stories.`);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [feedType, pageNum]);

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="feed">
      <div className="feed-header">
        <h1>{feedType.charAt(0).toUpperCase() + feedType.slice(1)}</h1>
      </div>
      <div className="feed-content">
        {items.map((item, index) => (
          <div key={item.id} className="feed-item">
            <span className="item-rank">{listStart + index}.</span>
            <div className="item-content">
              <h3 className="item-title">
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.title}
                  </a>
                ) : (
                  <span>{item.title}</span>
                )}
                {item.domain && <span className="item-domain"> ({item.domain})</span>}
              </h3>
              <div className="item-meta">
                {item.points && <span>{item.points} points</span>}
                {item.user && <span> by {item.user}</span>}
                <span> {item.time_ago}</span>
                {item.comments_count !== undefined && (
                  <span> | {item.comments_count} comments</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="pagination">
        {pageNum > 1 && (
          <a href={`/${feedType}/${pageNum - 1}`}>← Previous</a>
        )}
        <span>Page {pageNum}</span>
        <a href={`/${feedType}/${pageNum + 1}`}>Next →</a>
      </div>
    </div>
  );
};
