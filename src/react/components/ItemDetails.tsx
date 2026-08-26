import { useParams } from 'react-router-dom';

export default function ItemDetails() {
    const { id } = useParams<'id'>();

    return (
        <main>
            <h2>Item details</h2>
            <p>Item {id}</p>
        </main>
    );
}
