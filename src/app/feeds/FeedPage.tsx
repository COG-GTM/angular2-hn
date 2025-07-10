import React from 'react';
import { useParams } from 'react-router-dom';

interface FeedPageProps {
  feedType: string;
}

export function FeedPage({ feedType }: FeedPageProps) {
  const { page } = useParams<{ page: string }>();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4 capitalize">{feedType}</h1>
      <p className="text-gray-600">Page {page}</p>
      <div className="mt-4">
        <p className="text-sm text-gray-500">
          Feed component placeholder - will be implemented in next phase
        </p>
      </div>
    </div>
  );
}
