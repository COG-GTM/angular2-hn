import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUser } from '../services/hackerNewsApi';
import { User } from '../models/User';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import '../styles/UserProfile.scss';

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setUser(null);
    setErrorMessage('');
    if (id) {
      fetchUser(id)
        .then(setUser)
        .catch(() => setErrorMessage('Could not load user ' + id + '.'));
    }
  }, [id]);

  return (
    <div className="user-profile">
      {!user && !errorMessage && <Loader />}
      {!user && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

      {user && (
        <div className="profile">
          <div className="mobile item-header">
            <p className="title-block">
              <span className="back-button" onClick={() => navigate(-1)}></span>
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
              <p dangerouslySetInnerHTML={{ __html: user.about }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
