import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { User as UserModel } from '../../models/user';
import { fetchUser } from '../../api/hackerNews';
import Loader from '../Loader/Loader';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import './User.scss';

export default function User() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserModel | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setUser(undefined);
    setErrorMessage('');

    fetchUser(id ?? '', controller.signal)
      .then((data) => setUser(data))
      .catch(() => {
        if (controller.signal.aborted) {
          return;
        }
        setErrorMessage('Could not load user ' + id + '.');
      });

    return () => controller.abort();
  }, [id]);

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
