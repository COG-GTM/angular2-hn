import { useParams } from 'react-router';

// TODO: Port item details and comments in a later phase.
export function ItemDetailsPage() {
  const { id } = useParams();
  return <h2>Item: {id}</h2>;
}
