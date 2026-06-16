import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User as UserModel } from '../../models/User';
import { fetchUser } from '../../services/hackerNewsApi';
import Loader from '../../components/Loader/Loader';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import './User.scss';

const User: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserModel | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;
    setUser(undefined);
    setErrorMessage('');
    fetchUser(id as string)
      .then((data) => {
        if (active) setUser(data);
      })
      .catch(() => {
        if (active) setErrorMessage('Could not load user ' + id + '.');
      });
    return () => {
      active = false;
    };
  }, [id]);

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
            <div className="other-details">
              <p dangerouslySetInnerHTML={{ __html: user.about }}></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default User;
