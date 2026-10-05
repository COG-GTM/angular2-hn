import { useParams } from 'react-router-dom';

// Phase 0 placeholder. Phase 1 (item details) ports src/app/item-details/ (+ comment/) here using useItem().
export default function ItemDetailsPage() {
  const { id } = useParams();
  return (
    <div className="main-content" data-testid="item-details-page" data-item-id={id}>
      item {id}
    </div>
  );
}
