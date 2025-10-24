import { useParams } from 'react-router-dom';

export default function ItemPage() {
    const { id } = useParams<{ id: string }>();

    return (
        <div>
            <h2>Item Details</h2>
            <p>Item ID: {id}</p>
            <p>Item details implementation will be added in subsequent phases.</p>
        </div>
    );
}
