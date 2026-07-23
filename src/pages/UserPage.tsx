import { useParams } from 'react-router-dom';

// Placeholder until the user profile feature is ported (PR 7).
export function UserPage() {
  const { id } = useParams();
  return <div data-testid="user-page">User placeholder: {id}</div>;
}
