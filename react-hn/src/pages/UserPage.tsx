import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchUser } from '../store/slices/usersSlice';

const UserPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  
  const userState = useSelector((state: RootState) => state.users[id!]);
  const { user, loading, error } = userState || { user: null, loading: false, error: null };

  useEffect(() => {
    if (id) {
      dispatch(fetchUser(id));
    }
  }, [dispatch, id]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!user) {
    return <div className="error">User not found</div>;
  }

  return (
    <div className="user-page">
      <div className="user-header">
        <h1>{user.id}</h1>
        <div className="user-stats">
          <div className="stat">
            <span className="stat-label">Karma:</span>
            <span className="stat-value">{user.karma}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Average:</span>
            <span className="stat-value">{user.avg}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Created:</span>
            <span className="stat-value">{user.created}</span>
          </div>
        </div>
      </div>
      
      {user.about && (
        <div className="user-about">
          <h2>About</h2>
          <div 
            className="about-content" 
            dangerouslySetInnerHTML={{ __html: user.about }}
          />
        </div>
      )}
    </div>
  );
};

export default UserPage;
