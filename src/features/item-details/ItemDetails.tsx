import { useParams } from 'react-router-dom';

// Placeholder for the lazy-loaded item route; fully implemented in Phase 7.
export default function ItemDetails() {
  const { id } = useParams();
  return (
    <div className="main-content">
      <p>Item: {id}</p>
    </div>
  );
}
