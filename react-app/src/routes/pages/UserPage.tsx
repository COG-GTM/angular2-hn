import React from 'react';
import { useParams } from 'react-router-dom';

const UserPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div>
      <h1>User Profile</h1>
      <p>User ID: {id}</p>
      <p>This component will be implemented in Phase 2</p>
    </div>
  );
};

export default UserPage;
