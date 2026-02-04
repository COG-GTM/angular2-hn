import { useParams } from 'react-router-dom';
import { useUser } from '../hooks/useHackerNews';

export function UserProfile() {
  const { id } = useParams<{ id: string }>();
  
  const { data: user, isLoading, error } = useUser(id || '');

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div>
      <h1>{user.id}</h1>
      <p>Karma: {user.karma}</p>
      <p>Created: {user.created}</p>
      {user.about && (
        <div dangerouslySetInnerHTML={{ __html: user.about }} />
      )}
    </div>
  );
}
