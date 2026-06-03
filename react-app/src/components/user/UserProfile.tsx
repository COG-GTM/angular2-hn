import { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUser } from '../../services/hackerNewsApi';
import { useFetch } from '../../hooks/useFetch';
import { Loader } from '../shared/Loader';
import { ErrorMessage } from '../shared/ErrorMessage';

function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const fetcher = useCallback(
    () => fetchUser(id!),
    [id],
  );

  const { data: user, loading, error } = useFetch(
    fetcher,
    [id],
    'Error fetching user profile',
  );

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;
  if (!user) return null;

  return (
    <div className="user-profile">
      <button className="back-button" onClick={() => navigate(-1)} aria-label="Go back"></button>
      <div className="main-details">
        <div className="name">{user.id}</div>
        <div className="detail">
          <span className="label">Karma: </span>
          <span className="right">{user.karma}</span>
        </div>
        <div className="detail">
          <span className="label">Created: </span>
          <span className="right">{user.created}</span>
        </div>
        {user.about && (
          <div className="about" dangerouslySetInnerHTML={{ __html: user.about }} />
        )}
      </div>
    </div>
  );
}

export default UserProfile;
