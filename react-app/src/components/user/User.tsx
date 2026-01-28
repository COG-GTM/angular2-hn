import { useParams } from 'react-router-dom';
import { useUser } from '../../hooks';

export function User() {
  const { id } = useParams<{ id: string }>();
  const { data: user, loading, error } = useUser(id || null);

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error.message}</div>;
  }

  if (!user) {
    return <div className="empty">User not found</div>;
  }

  return (
    <div className="user-profile">
      <h1 className="username">{user.id}</h1>
      <div className="meta">
        <div className="created">Created: {user.created}</div>
        <div className="karma">Karma: {user.karma}</div>
      </div>
      {user.about && (
        <div className="about" dangerouslySetInnerHTML={{ __html: user.about }} />
      )}
    </div>
  );
}
