import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useHackerNewsAPI';
import { Loader } from './Loader';
import { ErrorMessage } from './ErrorMessage';
import './User.css';

export const User: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userId = id || '';
  const { user, loading, error } = useUser(userId);

  const goBack = () => {
    navigate(-1);
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!user) {
    return null;
  }

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
};
