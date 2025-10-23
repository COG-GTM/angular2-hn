import { useParams } from 'react-router-dom';

export function ItemDetails() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Item Details</h1>
      <p className="text-gray-600">
        Viewing item with ID: {id}
      </p>
    </div>
  );
}
