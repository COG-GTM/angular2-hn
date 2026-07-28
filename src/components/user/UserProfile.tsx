import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchUser } from '../../services/hackerNewsApi';
import type { User } from '../../types/user';
import { ErrorMessage } from '../shared/ErrorMessage';
import { Loader } from '../shared/Loader';
import './UserProfile.scss';

export function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let ignore = false;
    setUser(undefined);
    setErrorMessage('');

    fetchUser(id ?? '')
      .then((result) => {
        if (!ignore) {
          setUser(result);
        }
      })
      .catch(() => {
        if (!ignore) {
          setErrorMessage(`Could not load user ${id}.`);
        }
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  const goBack = () => navigate(-1);

  if (!user) {
    if (errorMessage !== '') {
      return <ErrorMessage message={errorMessage} />;
    }
    return <Loader />;
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
}
