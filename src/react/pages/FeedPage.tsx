import React from 'react';
import { useParams, useLocation } from 'react-router-dom';

export const FeedPage: React.FC = () => {
  const { page } = useParams<{ page: string }>();
  const location = useLocation();
  
  const feedType = location.pathname.split('/')[1];

  return (
    <div>
      <h1>{feedType.toUpperCase()} Feed</h1>
      <p>Page: {page}</p>
      <p>Placeholder for FeedPage component (Phase 3)</p>
    </div>
  );
};
