import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHackerNewsAPI } from '../../hooks';
import { User as UserType } from '../../models';
import { Loader, ErrorMessage } from '../shared';
import './User.scss';

export function User() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const { fetchUser } = useHackerNewsAPI();

  useEffect(() => {
    if (!id) return;
    
    setUser(null);
    setErrorMessage('');
    
    fetchUser(id)
      .then(setUser)
      .catch(() => {
        setErrorMessage(`Could not load user ${id}.`);
      });
  }, [id, fetchUser]);

  const goBack = () => {
    navigate(-1);
  };

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
              <p dangerouslySetInnerHTML={{ __html: user.about }} />
            </div>
          )}
        </div>
      )}
    </>
  );
}
