import { useParams } from 'react-router-dom';

export function User() {
  const { id } = useParams<{ id: string }>();
  return <div>User Profile - ID: {id} (coming soon)</div>;
}

export default User;
