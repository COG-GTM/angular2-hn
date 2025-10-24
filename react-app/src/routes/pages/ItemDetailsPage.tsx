import React from 'react';
import { useParams } from 'react-router-dom';

const ItemDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div>
      <h1>Item Details</h1>
      <p>Item ID: {id}</p>
      <p>This component will be implemented in Phase 2</p>
    </div>
  );
};

export default ItemDetailsPage;
