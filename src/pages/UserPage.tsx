import { useParams } from 'react-router-dom';

export function UserPage() {
  const { id } = useParams();
  return <div className="user-placeholder">user {id}</div>;
}
