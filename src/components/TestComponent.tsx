import React, { useState, useEffect } from 'react';
import { useHackerNewsAPI } from '../hooks/useHackerNewsAPI';
import { useSettings } from '../contexts/SettingsContext';
import { Story } from '../types/story';

const TestComponent: React.FC = () => {
  const { fetchFeed, fetchUser } = useHackerNewsAPI();
  const { settings, toggleSettings, setTheme, toggleOpenLinksInNewTab } = useSettings();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testFetchFeed = async () => {
    setLoading(true);
    setError(null);
    try {
      const feedData = await fetchFeed('news', 1);
      setStories(feedData.slice(0, 5)); // Show first 5 stories
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch feed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Phase 1 Migration Test</h2>
      
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Settings Context Test</h3>
        <p><strong>Current Theme:</strong> {settings.theme}</p>
        <p><strong>Open Links in New Tab:</strong> {settings.openLinkInNewTab ? 'Yes' : 'No'}</p>
        <p><strong>Title Font Size:</strong> {settings.titleFontSize}px</p>
        <p><strong>List Spacing:</strong> {settings.listSpacing}px</p>
        <p><strong>Show Settings:</strong> {settings.showSettings ? 'Yes' : 'No'}</p>
        
        <div style={{ marginTop: '15px' }}>
          <button onClick={toggleSettings} style={{ marginRight: '10px' }}>
            Toggle Settings Panel
          </button>
          <button onClick={() => setTheme(settings.theme === 'default' ? 'night' : 'default')} style={{ marginRight: '10px' }}>
            Toggle Theme
          </button>
          <button onClick={toggleOpenLinksInNewTab}>
            Toggle Open Links in New Tab
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Hacker News API Test</h3>
        <button onClick={testFetchFeed} disabled={loading} style={{ marginBottom: '15px' }}>
          {loading ? 'Loading...' : 'Test Fetch Feed (Top 5 Stories)'}
        </button>
        
        {error && (
          <div style={{ color: 'red', marginBottom: '15px' }}>
            Error: {error}
          </div>
        )}
        
        {stories.length > 0 && (
          <div>
            <h4>Latest Stories:</h4>
            <ul>
              {stories.map((story) => (
                <li key={story.id} style={{ marginBottom: '10px' }}>
                  <strong>{story.title}</strong>
                  <br />
                  <small>
                    By: {story.user} | Points: {story.points} | Comments: {story.comments_count}
                  </small>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestComponent;
