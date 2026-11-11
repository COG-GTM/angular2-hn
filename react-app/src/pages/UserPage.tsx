import { useParams } from 'react-router';

// TODO: Port the user profile in a later phase.
export function UserPage() {
  const { id } = useParams();
  return <h2>User: {id}</h2>;
}
