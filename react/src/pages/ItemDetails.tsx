import { useParams } from 'react-router-dom';

function ItemDetails() {
    const { id } = useParams();
    return <div className="main-content">{id}</div>;
}

export default ItemDetails;
