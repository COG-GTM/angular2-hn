import { useParams, useLocation } from 'react-router-dom';

export function Feed() {
  const { page } = useParams<{ page: string }>();
  const location = useLocation();
  
  const feedType = location.pathname.split('/')[1];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">
        {feedType?.toUpperCase()} Feed - Page {page}
      </h1>
      <p className="text-gray-600">
        Feed component for type: {feedType}, page: {page}
      </p>
    </div>
  );
}
