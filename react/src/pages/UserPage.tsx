// OWNER: Session 3 (user profile). Stub — port src/app/user.
// Route module for React Router `lazy`: must export `Component`.
import { useParams } from 'react-router-dom';

export function Component() {
  const { id } = useParams();
  return <div className="app-user">TODO user {id}</div>;
}
