import { useParams } from 'react-router-dom';
import { useUser } from '../hooks/useHackerNews';

/**
 * User component - placeholder for Phase 2 migration
 * This will replace Angular's UserComponent
 */
function User() {
  const { id } = useParams<{ id: string }>();

  const { data: user, isLoading, error } = useUser(id || '');

  if (isLoading) {
    return (
      <div className="app-loader">
        <img className="logo" src="/logo.svg" alt="Loading..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <p>Error loading user. Please try again.</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="error-message">
        <p>User not found.</p>
      </div>
    );
  }

  return (
    <div className="user-profile">
      <h1>{user.id}</h1>
      <div className="user-meta">
        <p>Created: {user.created}</p>
        <p>Karma: {user.karma}</p>
      </div>
      {user.about && (
        <div
          className="user-about"
          dangerouslySetInnerHTML={{ __html: user.about }}
        />
      )}
    </div>
  );
}

export default User;
