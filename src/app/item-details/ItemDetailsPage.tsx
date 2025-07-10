import React from 'react';
import { useParams } from 'react-router-dom';

export function ItemDetailsPage() {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Item Details</h1>
      <p className="text-gray-600">Item ID: {id}</p>
      <div className="mt-4">
        <p className="text-sm text-gray-500">
          Item details component placeholder - will be implemented in next phase
        </p>
      </div>
    </div>
  );
}
