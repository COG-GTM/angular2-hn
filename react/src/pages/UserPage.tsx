// Port of src/app/user (user profile).
// Route module for React Router `lazy`: must export `Component`.
import { useNavigate, useParams } from 'react-router-dom';
import { hackerNewsApi } from '../api/hackernews';
import { ErrorMessage } from '../components/shared/ErrorMessage';
import { Loader } from '../components/shared/Loader';
import { useAsync } from '../hooks/useAsync';
import './UserPage.scss';

export function Component() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data: user, error } = useAsync((signal) => hackerNewsApi.fetchUser(id, signal), [id]);

  return (
    <div className="app-user">
      {!user && !error && <Loader />}
      {!user && !!error && <ErrorMessage message={`Could not load user ${id}.`} />}
      {user && (
        <div className="profile">
          <div className="mobile item-header">
            <p className="title-block">
              <span className="back-button" onClick={() => navigate(-1)}></span> Profile: {user.id}{' '}
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
}
