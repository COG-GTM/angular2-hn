import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { hackerNewsAPI } from '../services/hackernews-api';
import type { User as UserType } from '../types';

export const User: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const userId = searchParams.get('id');

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setError('No user ID provided');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const userData = await hackerNewsAPI.fetchUser(userId);
        setUser(userData);
      } catch (err) {
        setError('Could not load user profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!user) {
    return <div className="error-message">User not found</div>;
  }

  return (
    <div className="user-profile">
      <div className="user-header">
        <h1>{user.id}</h1>
      </div>
      
      <div className="user-details">
        <div className="user-stat">
          <span className="stat-label">Karma:</span>
          <span className="stat-value">{user.karma}</span>
        </div>
        
        <div className="user-stat">
          <span className="stat-label">Created:</span>
          <span className="stat-value">{user.created}</span>
        </div>

        {user.about && (
          <div className="user-about">
            <h3>About</h3>
            <div dangerouslySetInnerHTML={{ __html: user.about }} />
          </div>
        )}
      </div>
    </div>
  );
};
