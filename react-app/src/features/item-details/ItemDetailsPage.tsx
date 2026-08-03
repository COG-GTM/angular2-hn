import { useParams } from 'react-router-dom';

export default function ItemDetailsPage() {
    const { id } = useParams<{ id: string }>();

    return <div className="main-content" data-testid="item-details-page" data-item-id={id}></div>;
}
