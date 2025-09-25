import { useParams } from 'react-router-dom';
import { useUser } from '../services/hackerNewsApi';
import Loader from '../components/shared/Loader';
import ErrorMessage from '../components/shared/ErrorMessage';

const User = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data: user, isLoading, error } = useUser(id!);

  if (isLoading) return <Loader />;
  if (error) return <ErrorMessage message="Could not load user profile." />;
  if (!user) return <ErrorMessage message="User not found." />;

  return (
    <div className="user-profile">
      <h1>User: {user.id}</h1>
      
      <div className="user-info">
        <div className="user-stat">
          <strong>Karma:</strong> {user.karma}
        </div>
        <div className="user-stat">
          <strong>Created:</strong> {user.created}
        </div>
        {user.avg && (
          <div className="user-stat">
            <strong>Average:</strong> {user.avg}
          </div>
        )}
      </div>

      {user.about && (
        <div className="user-about">
          <h3>About</h3>
          <div dangerouslySetInnerHTML={{ __html: user.about }} />
        </div>
      )}
    </div>
  );
};

export default User;
