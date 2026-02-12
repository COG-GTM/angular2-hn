import { useParams } from 'react-router-dom';

export function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  return <div>Item Details - ID: {id} (coming soon)</div>;
}

export default ItemDetails;
