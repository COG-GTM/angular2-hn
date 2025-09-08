import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchFeed } from '../store/slices/feedsSlice';
import { useSettings } from '../contexts/SettingsContext';

interface FeedPageProps {
  feedType: string;
}

const FeedPage: React.FC<FeedPageProps> = ({ feedType }) => {
  const { page = '1' } = useParams<{ page: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { settings } = useSettings();
  
  const feedState = useSelector((state: RootState) => state.feeds[feedType]);
  const { stories = [], loading = false, error = null } = feedState || {};

  const pageNum = parseInt(page, 10) || 1;

  useEffect(() => {
    dispatch(fetchFeed({ feedType, page: pageNum }));
  }, [dispatch, feedType, pageNum]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="feed-page">
      <div className="feed-header">
        <h1>{feedType.charAt(0).toUpperCase() + feedType.slice(1)} Stories</h1>
      </div>
      <div className="stories-list">
        {stories.map((story, index) => (
          <div 
            key={story.id} 
            className="story-item"
            style={{ 
              fontSize: `${settings.titleFontSize}px`,
              marginBottom: `${settings.listSpacing}px`
            }}
          >
            <div className="story-rank">{(pageNum - 1) * 30 + index + 1}.</div>
            <div className="story-content">
              <div className="story-title">
                {story.url ? (
                  <a 
                    href={story.url} 
                    target={settings.openLinkInNewTab ? '_blank' : '_self'}
                    rel={settings.openLinkInNewTab ? 'noopener noreferrer' : undefined}
                  >
                    {story.title}
                  </a>
                ) : (
                  <Link to={`/item/${story.id}`}>{story.title}</Link>
                )}
                {story.domain && <span className="domain">({story.domain})</span>}
              </div>
              <div className="story-meta">
                {story.points} points by{' '}
                <Link to={`/user/${story.user}`}>{story.user}</Link>{' '}
                {story.time_ago} |{' '}
                <Link to={`/item/${story.id}`}>
                  {story.comments_count} comments
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="pagination">
        {pageNum > 1 && (
          <Link to={`/${feedType}/${pageNum - 1}`} className="pagination-link">
            Previous
          </Link>
        )}
        <span className="current-page">Page {pageNum}</span>
        <Link to={`/${feedType}/${pageNum + 1}`} className="pagination-link">
          Next
        </Link>
      </div>
    </div>
  );
};

export default FeedPage;
