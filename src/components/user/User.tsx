import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User as UserType } from '../../models';
import { useHackerNewsAPI } from '../../hooks/useHackerNewsAPI';
import { Loader, ErrorMessage } from '../shared';
import './User.scss';

const User: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const { fetchUser } = useHackerNewsAPI();

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setErrorMessage('');
    setUser(null);

    fetchUser(id)
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        setErrorMessage(`Could not load user ${id}.`);
        setLoading(false);
      });
  }, [id, fetchUser]);

  const goBack = () => {
    navigate(-1);
  };

  if (loading) {
    return <Loader />;
  }

  if (errorMessage) {
    return <ErrorMessage message={errorMessage} />;
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

export default User;
