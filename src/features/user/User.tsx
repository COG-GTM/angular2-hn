import { useParams } from 'react-router-dom';

// Placeholder for the lazy-loaded user route; fully implemented in Phase 8.
export default function User() {
  const { id } = useParams();
  return (
    <div className="main-content">
      <p>User: {id}</p>
    </div>
  );
}
