import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User as UserModel } from '../../models/user';
import { fetchUser } from '../../services/hackerNewsApi';
import ErrorMessage from '../../components/shared/ErrorMessage';
import Loader from '../../components/shared/Loader';
import { sanitizeHtml } from '../../utils/sanitize';
import './User.scss';

export default function User() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserModel>();
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    setUser(undefined);
    setError('');
    fetchUser(id ?? '')
      .then((nextUser) => {
        if (!ignore) {
          setUser(nextUser);
        }
      })
      .catch(() => {
        if (!ignore) {
          setError(`Could not load user ${id}.`);
        }
      });
    return () => {
      ignore = true;
    };
  }, [id]);

  return (
    <div className="app-user">
      {!user && !error && <Loader />}
      {!user && error && <ErrorMessage message={error} />}
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
            <span className="right">{user.karma} ★</span>
            <p className="age">Created {user.created}</p>
          </div>
          {user.about && <div className="other-details"><p dangerouslySetInnerHTML={{ __html: sanitizeHtml(user.about) }} /></div>}
        </div>
      )}
    </div>
  );
}
