import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/useHackerNewsAPI';
import Loader from '../shared/Loader';
import ErrorMessage from '../shared/ErrorMessage';
import './UserProfile.scss';

function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const userId = id || '';
  const { user, loading, error } = useUser(userId);
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  return (
    <>
      {loading && !error && <Loader />}
      {error && <ErrorMessage message={error} />}

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

export default UserProfile;
