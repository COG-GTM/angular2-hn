import { useParams } from 'react-router-dom';

export default function ItemDetailsPage() {
    const { id } = useParams();
    return <p>Item {id}</p>;
}
