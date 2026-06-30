import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Loader from '../../components/Loader/Loader';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import { fetchUser } from '../../services/hackernews-api';
import type { User as HNUser } from '../../models/user';
import './User.scss';

export default function User() {
  const { id } = useParams();
  const userID = id ?? '';
  const navigate = useNavigate();

  const [user, setUser] = useState<HNUser | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let ignore = false;
    setUser(undefined);
    setErrorMessage('');
    fetchUser(userID)
      .then((data) => {
        if (!ignore) setUser(data);
      })
      .catch(() => {
        if (!ignore) setErrorMessage('Could not load user ' + userID + '.');
      });
    return () => {
      ignore = true;
    };
  }, [userID]);

  const goBack = () => navigate(-1);

  return (
    <>
      {!user && !errorMessage && <Loader />}
      {!user && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

      {user && (
        <div className="profile">
          <div className="mobile item-header">
            <p className="title-block">
              <span className="back-button" onClick={() => goBack()}></span>
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
              <p dangerouslySetInnerHTML={{ __html: user.about }}></p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
