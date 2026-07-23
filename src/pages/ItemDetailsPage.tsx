import { useParams } from 'react-router-dom';

// Placeholder until the item-details feature is ported (PR 6).
export function ItemDetailsPage() {
  const { id } = useParams();
  return <div data-testid="item-details-page">Item placeholder: {id}</div>;
}
