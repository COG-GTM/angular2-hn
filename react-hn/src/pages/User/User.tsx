import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import Loader from '../../components/Loader/Loader';
import { User as UserModel } from '../../models/User';
import { fetchUser } from '../../services/hackerNewsApi';

import styles from './User.module.scss';

const User: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserModel | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    setUser(null);
    setErrorMessage('');

    fetchUser(id as string, controller.signal)
      .then(setUser)
      .catch(() => {
        if (!controller.signal.aborted) {
          setErrorMessage(`Could not load user ${id}.`);
        }
      });

    return () => controller.abort();
  }, [id]);

  return (
    <div className={styles.host}>
      {!user && !errorMessage && <Loader />}
      {!user && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

      {user && (
        <div className="profile">
          <div className="mobile item-header">
            <p className="title-block">
              <span className="back-button" onClick={() => navigate(-1)} />
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
      )}
    </div>
  );
};

export default User;
