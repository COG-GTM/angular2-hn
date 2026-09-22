import { useParams } from 'react-router-dom';

export function ItemDetailsPage() {
  const { id } = useParams();
  return <div className="item-placeholder">item {id}</div>;
}
