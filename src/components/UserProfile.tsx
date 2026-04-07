import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useHackerNewsAPI';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';
import '../styles/UserProfile.scss';

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading, error } = useUser(id!);

  const goBack = () => {
    navigate(-1);
  };

  if (loading && !user) {
    return <Loader />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!user) return null;

  return (
    <div className="user-profile-component">
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
    </div>
  );
}
