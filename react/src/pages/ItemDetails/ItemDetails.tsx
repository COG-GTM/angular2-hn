import { useParams } from 'react-router-dom';

export function ItemDetails() {
  const { id } = useParams();
  return <main className="item-details">item {id}</main>;
}

export default ItemDetails;
