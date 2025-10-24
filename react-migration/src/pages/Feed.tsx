import { useParams, useLocation } from 'react-router-dom';

interface FeedProps {
  feedType: 'news' | 'newest' | 'show' | 'ask' | 'jobs';
}

export default function Feed({ feedType }: FeedProps) {
  const { page } = useParams<{ page: string }>();
  const location = useLocation();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 capitalize">{feedType} Feed</h1>
      <p className="text-gray-600 mb-4">Page: {page || '1'}</p>
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-lg">
          This is the <span className="font-semibold">{feedType}</span> feed page {page || '1'}.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Route: {location.pathname}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Component migration will happen in Phase 2.
        </p>
      </div>
    </div>
  );
}
