import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useHackerNewsAPI';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';
import '../styles/User.scss';

export const User: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading, error } = useUser(id || '');

  const goBack = () => {
    navigate(-1);
  };

  if (loading) {
    return <Loader />;
  }

  if (error || !user) {
    return <ErrorMessage message={error || 'User not found'} />;
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

export default User;
