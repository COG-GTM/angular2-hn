import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchUser } from '../api/hackerNewsApi';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import type { User } from '../types/User';
import './UserProfile.scss';

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    setUser(null);
    setError('');

    fetchUser(id)
      .then(data => setUser(data))
      .catch(() => setError(`Could not load user ${id}.`));
  }, [id]);

  if (!user && !error) {
    return <Loader />;
  }

  if (!user && error) {
    return <ErrorMessage message={error} />;
  }

  if (!user) return null;

  return (
    <div className="profile">
      {/* Mobile header */}
      <div className="mobile item-header">
        <p className="title-block">
          <span className="back-button" onClick={() => window.history.back()} />
          Profile: {user.id}
        </p>
      </div>

      <div className="main-details">
        <span className="name">{user.id}</span>
        <span className="right">{user.karma} &#9733;</span>
        <p className="age">Created {user.created}</p>
      </div>

      {user.about && (
        <div className="other-details">
          <p dangerouslySetInnerHTML={{ __html: user.about }} />
        </div>
      )}
    </div>
  );
}
