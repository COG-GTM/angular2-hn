import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useHackerNewsAPI } from '../../../hooks/useHackerNewsAPI';
import type { Story } from '../../shared/models';

interface FeedProps {}

export const Feed: React.FC<FeedProps> = () => {
  const { page } = useParams<{ page: string }>();
  const location = useLocation();
  const feedType = location.pathname.split('/')[1] || 'news';
  const pageNum = page ? parseInt(page, 10) : 1;
  
  const { fetchFeed } = useHackerNewsAPI();
  const { data: items, isLoading, error } = fetchFeed(feedType, pageNum);

  const listStart = ((pageNum - 1) * 30) + 1;

  if (isLoading) {
    return <div className="loader">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">Could not load {feedType} stories.</div>;
  }

  return (
    <div className="feed">
      <div className="feed-content">
        {items?.map((item: Story, index: number) => (
          <div key={item.id} className="feed-item">
            <span className="item-number">{listStart + index}.</span>
            <div className="item-content">
              <h3 className="item-title">
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {item.title}
                </a>
              </h3>
              <div className="item-meta">
                {item.points} points by {item.user} {item.time_ago} | {item.comments_count} comments
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
