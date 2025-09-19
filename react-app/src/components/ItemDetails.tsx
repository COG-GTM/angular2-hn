import { useParams } from 'react-router-dom';

export function ItemDetails() {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1>Item Details</h1>
      <p>Item ID: {id}</p>
    </div>
  );
}
