import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { hackerNewsApi } from '../../services/hackerNewsApi';
import { Story } from '../../models';

const ItemDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await hackerNewsApi.fetchItemContent(parseInt(id, 10));
        setStory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch item');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  if (loading) return <div className="loader">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!story) return <div className="error">Story not found</div>;

  return (
    <div className="item-details">
      <h1>{story.title}</h1>
      <div className="item-meta">
        {story.points} points by {story.user} {story.time_ago}
      </div>
      {story.url && (
        <div className="item-url">
          <a href={story.url} target="_blank" rel="noopener noreferrer">
            {story.url}
          </a>
        </div>
      )}
      {story.content && (
        <div className="item-content" dangerouslySetInnerHTML={{ __html: story.content }} />
      )}
      <div className="comments-section">
        <h3>Comments ({story.comments_count})</h3>
        {/* Comments will be implemented in later phases */}
        <p>Comments component will be implemented in Phase 2</p>
      </div>
    </div>
  );
};

export default ItemDetails;
