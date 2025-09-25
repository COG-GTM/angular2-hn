import React, { useState } from 'react';
import { useFetchUser } from '../hooks/useHackerNewsAPI';

const UserDemo: React.FC = () => {
  const [userId, setUserId] = useState('pg');
  const { data: userData, loading, error } = useFetchUser(userId);

  return (
    <div className="user-demo">
      <h2>User API Demo</h2>
      
      <div className="controls">
        <label>
          User ID: 
          <input 
            type="text" 
            value={userId} 
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter username (e.g., pg, patio11)"
          />
        </label>
      </div>

      <div className="user-content">
        {loading && <p>Loading user...</p>}
        {error && <p className="error">Error: {error}</p>}
        {userData && (
          <div className="user-info">
            <h3>User: {userData.id}</h3>
            <p><strong>Karma:</strong> {userData.karma}</p>
            <p><strong>Created:</strong> {userData.created}</p>
            <p><strong>Average:</strong> {userData.avg}</p>
            {userData.about && (
              <div>
                <strong>About:</strong>
                <div dangerouslySetInnerHTML={{ __html: userData.about }} />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="sample-users">
        <h3>Try these sample users:</h3>
        <button onClick={() => setUserId('pg')}>pg</button>
        <button onClick={() => setUserId('patio11')}>patio11</button>
        <button onClick={() => setUserId('tptacek')}>tptacek</button>
        <button onClick={() => setUserId('dang')}>dang</button>
      </div>
    </div>
  );
};

export default UserDemo;
