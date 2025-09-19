import { useParams } from 'react-router-dom';

export function User() {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1>User Profile</h1>
      <p>User ID: {id}</p>
    </div>
  );
}
