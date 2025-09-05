import { useParams, useNavigate } from 'react-router-dom';
import { useFetchUser } from '../../hooks/useHackerNewsAPI';

export function User() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: user, loading, error } = useFetchUser(id || '');

  if (loading) {
    return <div className="text-center py-10 text-gray-600">Loading user...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  if (!user) {
    return <div className="text-center py-10 text-red-600">User not found</div>;
  }

  return (
    <div className="max-w-2xl">
      <button 
        onClick={() => navigate(-1)} 
        className="bg-transparent border-none text-gray-600 cursor-pointer text-sm mb-4 hover:underline"
      >
        ← Back
      </button>
      
      <div className="bg-white border border-gray-300 p-4">
        <h1 className="text-lg font-normal mb-4">{user.id}</h1>
        <div className="mb-4">
          <div className="mb-2 text-sm">
            <strong>Karma:</strong> {user.karma}
          </div>
          <div className="mb-2 text-sm">
            <strong>Created:</strong> {user.created}
          </div>
          {user.avg && (
            <div className="mb-2 text-sm">
              <strong>Average:</strong> {user.avg}
            </div>
          )}
        </div>
        {user.about && (
          <div>
            <h2 className="text-base font-normal mb-2">About</h2>
            <div className="leading-relaxed" dangerouslySetInnerHTML={{ __html: user.about }} />
          </div>
        )}
      </div>
    </div>
  );
}
