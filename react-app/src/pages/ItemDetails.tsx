import { useParams, useNavigate } from 'react-router-dom';

export default function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="item-details">
      <button onClick={() => navigate(-1)}>Back</button>
      <p>Item Details for ID: {id}</p>
      <p>Placeholder - will be implemented in next PR</p>
    </div>
  );
}
