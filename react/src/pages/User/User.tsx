import { useParams } from 'react-router-dom';

export function User() {
  const { id } = useParams();
  return <main className="user">user {id}</main>;
}

export default User;
