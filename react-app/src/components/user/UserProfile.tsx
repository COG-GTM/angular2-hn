import { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUser } from '../../services/hackerNewsApi';
import { useFetch } from '../../hooks/useFetch';
import { Loader } from '../shared/Loader';
import { ErrorMessage } from '../shared/ErrorMessage';
import './UserProfile.scss';

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
    `Could not load user ${id}.`,
  );

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;
  if (!user) return null;

  return (
    <div className="profile">
      <div className="mobile item-header">
        <p className="title-block">
          <span className="back-button" onClick={() => navigate(-1)}></span>
          Profile: {user.id}
        </p>
      </div>
      <div className="main-details">
        <span className="name">{user.id}</span>
        <span className="right">{user.karma} ★</span>
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

export default UserProfile;
