import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import type { User as UserModel } from '../models';
import { fetchUser } from '../services/hackernewsApi';
import { Loader } from './Loader';
import { ErrorMessage } from './ErrorMessage';
import './User.scss';

export function User() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserModel | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setUser(undefined);
    setErrorMessage('');

    const userID = params.id ?? '';
    fetchUser(userID, controller.signal)
      .then((data) => setUser(data))
      .catch((error: unknown) => {
        if ((error as Error)?.name === 'AbortError') {
          return;
        }
        setErrorMessage('Could not load user ' + userID + '.');
      });

    return () => controller.abort();
  }, [params.id]);

  const goBack = () => navigate(-1);

  return (
    <>
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
            <div className="other-details">
              <p dangerouslySetInnerHTML={{ __html: user.about }}></p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
