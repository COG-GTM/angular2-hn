import { useParams } from 'react-router-dom';

export default function UserPage() {
    const { id } = useParams<{ id: string }>();

    return (
        <div>
            <h2>User Profile</h2>
            <p>User ID: {id}</p>
            <p>User profile implementation will be added in subsequent phases.</p>
        </div>
    );
}
