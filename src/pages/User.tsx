import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useHackerNews';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import './User.scss';

export function User() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userId = id || '';

  const { data: user, isLoading, error } = useUser(userId);

  const goBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error || !user) {
    return <ErrorMessage message={`Could not load user ${userId}.`} />;
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
