import { useParams } from 'react-router-dom';

export default function UserPage() {
    const { id } = useParams();
    return <p>User {id}</p>;
}
