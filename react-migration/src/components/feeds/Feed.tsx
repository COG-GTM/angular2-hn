import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { hackerNewsApi } from '../../services/hackerNewsApi';
import { Story, FeedType } from '../../models';

interface FeedProps {
  feedType: FeedType;
}

const Feed: React.FC<FeedProps> = ({ feedType }) => {
  const { page } = useParams<{ page: string }>();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);
        setError(null);
        const pageNum = parseInt(page || '1', 10);
        const data = await hackerNewsApi.fetchFeed(feedType, pageNum);
        setStories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch feed');
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [feedType, page]);

  if (loading) return <div className="loader">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="feed">
      <h1>{feedType.charAt(0).toUpperCase() + feedType.slice(1)}</h1>
      <div className="stories">
        {stories.map((story, index) => (
          <div key={story.id} className="story-item">
            <span className="story-rank">{((parseInt(page || '1') - 1) * 30) + index + 1}.</span>
            <div className="story-content">
              <h3 className="story-title">
                {story.url ? (
                  <a href={story.url} target="_blank" rel="noopener noreferrer">
                    {story.title}
                  </a>
                ) : (
                  story.title
                )}
              </h3>
              <div className="story-meta">
                {story.points} points by {story.user} {story.time_ago} | {story.comments_count} comments
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feed;
