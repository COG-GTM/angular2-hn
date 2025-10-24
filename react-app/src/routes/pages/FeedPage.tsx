import React from 'react';
import { useParams } from 'react-router-dom';

interface FeedPageProps {
  feedType: string;
}

const FeedPage: React.FC<FeedPageProps> = ({ feedType }) => {
  const { page } = useParams<{ page: string }>();
  
  return (
    <div>
      <h1>{feedType.charAt(0).toUpperCase() + feedType.slice(1)} Feed</h1>
      <p>Page: {page}</p>
      <p>This component will be implemented in Phase 2</p>
    </div>
  );
};

export default FeedPage;
