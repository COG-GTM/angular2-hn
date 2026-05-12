import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchUser } from '../services/hackernews-api';
import type { User as UserModel } from '../types/user';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import './user.component.scss';

export default function User() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserModel | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    setUser(null);
    setErrorMessage('');
    if (!id) return;
    fetchUser(id)
      .then((data) => {
        if (cancelled) return;
        setUser(data);
      })
      .catch(() => {
        if (cancelled) return;
        setErrorMessage(`Could not load user ${id}.`);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const goBack = () => navigate(-1);

  return (
    <>
      {!user && !errorMessage && <Loader />}
      {!user && errorMessage && <ErrorMessage message={errorMessage} />}

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
            <div className="other-details">
              <p dangerouslySetInnerHTML={{ __html: user.about }}></p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
