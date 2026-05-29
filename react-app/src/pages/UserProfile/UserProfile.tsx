import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { User } from '../../types';
import { fetchUser } from '../../services/hackernews-api';
import { Loader } from '../../components/Loader/Loader';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import './UserProfile.scss';

export function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    setUser(null);
    setErrorMessage('');

    if (id) {
      fetchUser(id, controller.signal)
        .then(data => {
          if (!cancelled) setUser(data);
        })
        .catch(err => {
          if (!cancelled && err.name !== 'AbortError') {
            setErrorMessage(`Could not load user ${id}.`);
          }
        });
    }

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [id]);

  const goBack = () => navigate(-1);

  if (!user && !errorMessage) return <Loader />;
  if (!user && errorMessage) return <ErrorMessage message={errorMessage} />;
  if (!user) return null;

  return (
    <div className="profile">
      <div className="mobile item-header">
        <p className="title-block">
          <span className="back-button" onClick={goBack}></span>
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
