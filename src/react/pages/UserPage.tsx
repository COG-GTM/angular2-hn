import React from 'react';
import { useParams } from 'react-router-dom';

export const UserPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1>User Profile</h1>
      <p>User ID: {id}</p>
      <p>Placeholder for UserPage component (Phase 3)</p>
    </div>
  );
};
