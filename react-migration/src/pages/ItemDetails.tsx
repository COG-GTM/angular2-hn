import { useParams } from 'react-router-dom';

export default function ItemDetails() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Item Details (Lazy Loaded)</h1>
      <p className="text-gray-600 mb-4">Item ID: {id}</p>
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-lg">
          This is the item details page for item <span className="font-semibold">{id}</span>.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          This component is lazy loaded using React.lazy().
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Component migration will happen in Phase 2.
        </p>
      </div>
    </div>
  );
}
