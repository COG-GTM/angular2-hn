import { useParams, useNavigate } from 'react-router-dom';

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="user-profile">
      <button onClick={() => navigate(-1)}>Back</button>
      <p>User Profile for: {id}</p>
      <p>Placeholder - will be implemented in next PR</p>
    </div>
  );
}
