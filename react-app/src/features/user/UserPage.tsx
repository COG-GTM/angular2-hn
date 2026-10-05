import { useParams } from 'react-router-dom';

// Phase 0 placeholder. Phase 1 (user) ports src/app/user/ here using useUser().
export default function UserPage() {
  const { id } = useParams();
  return (
    <div className="profile" data-testid="user-page" data-user-id={id}>
      user {id}
    </div>
  );
}
