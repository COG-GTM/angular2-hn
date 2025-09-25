import React, { useState } from 'react';
import { useFetchFeed, useFetchItemContent } from '../hooks/useHackerNewsAPI';
import { useSettings } from '../contexts/SettingsContext';

const FeedDemo: React.FC = () => {
  const [feedType, setFeedType] = useState('news');
  const [page, setPage] = useState(1);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const { settings } = useSettings();
  
  const { data: feedData, loading: feedLoading, error: feedError } = useFetchFeed(feedType, page);
  const { data: itemData, loading: itemLoading, error: itemError } = useFetchItemContent(selectedItemId || 0);

  const feedTypes = ['news', 'newest', 'show', 'ask', 'jobs'];

  return (
    <div className="feed-demo">
      <h2>HackerNews API Demo</h2>
      
      <div className="controls">
        <div>
          <label>Feed Type: </label>
          <select value={feedType} onChange={(e) => setFeedType(e.target.value)}>
            {feedTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label>Page: </label>
          <input 
            type="number" 
            value={page} 
            onChange={(e) => setPage(parseInt(e.target.value) || 1)}
            min="1"
          />
        </div>
      </div>

      <div className="feed-content">
        <div className="feed-list">
          <h3>Feed Items</h3>
          {feedLoading && <p>Loading feed...</p>}
          {feedError && <p className="error">Error: {feedError}</p>}
          {feedData && (
            <ul>
              {feedData.slice(0, 10).map(item => (
                <li key={item.id}>
                  <button 
                    onClick={() => setSelectedItemId(item.id)}
                    className={selectedItemId === item.id ? 'selected' : ''}
                  >
                    {item.title} ({item.points} points)
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="item-details">
          <h3>Item Details</h3>
          {selectedItemId && (
            <>
              {itemLoading && <p>Loading item...</p>}
              {itemError && <p className="error">Error: {itemError}</p>}
              {itemData && (
                <div>
                  <h4>{itemData.title}</h4>
                  <p>Points: {itemData.points}</p>
                  <p>User: {itemData.user}</p>
                  <p>Comments: {itemData.comments_count}</p>
                  <p>Type: {itemData.type}</p>
                  {itemData.url && <p>URL: <a href={itemData.url} target={settings.openLinkInNewTab ? '_blank' : '_self'}>{itemData.url}</a></p>}
                  {itemData.type === 'poll' && itemData.poll && (
                    <div>
                      <h5>Poll Results (Total votes: {itemData.poll_votes_count})</h5>
                      <ul>
                        {itemData.poll.map((option, index) => (
                          <li key={index}>
                            {option.content}: {option.points} votes
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedDemo;
