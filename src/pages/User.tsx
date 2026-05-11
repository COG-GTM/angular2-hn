import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchUser } from '../api/hackerNewsApi';
import type { User as UserType } from '../types/user';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import './User.scss';

export function User() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [prevId, setPrevId] = useState(params.id);

  if (prevId !== params.id) {
    setPrevId(params.id);
    setUser(null);
    setErrorMessage('');
  }

  const doFetch = useCallback((userId: string, signal: AbortSignal) => {
    fetchUser(userId, signal)
      .then((data) => setUser(data))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setErrorMessage(`Could not load user ${userId}.`);
      });
  }, []);

  useEffect(() => {
    const userId = params.id;
    if (!userId) return;

    const controller = new AbortController();
    doFetch(userId, controller.signal);

    return () => controller.abort();
  }, [params.id, doFetch]);

  const goBack = () => navigate(-1);

  return (
    <div className="user-page">
      {!user && !errorMessage && <Loader />}
      {!user && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

      {user && (
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
            <div
              className="other-details"
              dangerouslySetInnerHTML={{ __html: user.about }}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default User;
