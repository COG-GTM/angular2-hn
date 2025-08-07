import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { hackerNewsApi } from '../../services/hackerNewsApi';
import { User as UserModel } from '../../models';

const User: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await hackerNewsApi.fetchUser(id);
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) return <div className="loader">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!user) return <div className="error">User not found</div>;

  return (
    <div className="user-profile">
      <h1>User: {user.id}</h1>
      <div className="user-info">
        <p><strong>Karma:</strong> {user.karma}</p>
        <p><strong>Created:</strong> {user.created}</p>
        {user.about && (
          <div className="user-about">
            <h3>About:</h3>
            <div dangerouslySetInnerHTML={{ __html: user.about }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default User;
