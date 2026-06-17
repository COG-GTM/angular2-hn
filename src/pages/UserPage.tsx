import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUser } from '../services/hackerNewsApi';
import { User } from '../models/user';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import './UserPage.scss';

function UserPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setUser(null);
    setErrorMessage('');

    if (id) {
      fetchUser(id)
        .then(data => setUser(data))
        .catch(() => setErrorMessage(`Could not load user ${id}.`));
    }
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
              <p dangerouslySetInnerHTML={{ __html: user.about }} />
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default UserPage;
