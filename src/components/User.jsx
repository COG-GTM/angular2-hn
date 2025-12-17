import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useHackerNewsAPI } from '../hooks/useHackerNewsAPI';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';
import './User.scss';

export function User() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const { fetchUser } = useHackerNewsAPI();

  useEffect(() => {
    setLoading(true);
    setErrorMessage('');
    setUser(null);

    fetchUser(id)
      .then(data => {
        setUser(data);
      })
      .catch(() => setErrorMessage(`Could not load user ${id}.`))
      .finally(() => setLoading(false));
  }, [id, fetchUser]);

  const goBack = () => {
    navigate(-1);
  };

  return (
    <>
      {loading && !errorMessage && <Loader />}
      {!loading && errorMessage && <ErrorMessage message={errorMessage} />}

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

export default User;
