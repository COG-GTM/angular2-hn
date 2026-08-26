import { useParams } from 'react-router-dom';

export default function User() {
    const { id } = useParams<'id'>();

    return (
        <main>
            <h2>User</h2>
            <p>{id}</p>
        </main>
    );
}
