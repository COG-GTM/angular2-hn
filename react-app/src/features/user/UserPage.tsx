import { useParams } from 'react-router-dom';

export default function UserPage() {
    const { id } = useParams<{ id: string }>();

    return <div className="profile" data-testid="user-page" data-user-id={id}></div>;
}
