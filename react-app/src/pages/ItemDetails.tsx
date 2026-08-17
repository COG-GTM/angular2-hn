import { useParams } from 'react-router-dom';

export function ItemDetails() {
    const { id } = useParams();
    return <div className="main-content">Item {id}</div>;
}
