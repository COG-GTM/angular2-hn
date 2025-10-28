import React from 'react';
import { useParams } from 'react-router-dom';

export const ItemDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1>Item Details</h1>
      <p>Item ID: {id}</p>
      <p>Placeholder for ItemDetailsPage component (Phase 3)</p>
    </div>
  );
};
