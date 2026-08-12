import { useNavigate, useParams } from 'react-router-dom';

import { useUser } from '../api/queries';
import ErrorMessage from '../components/ErrorMessage';
import Loader from '../components/Loader';

export default function UserPage() {
    const { id = '' } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: user, isError, isPending } = useUser(id);

    if (isError) {
        return <ErrorMessage message={`Could not load user ${id}.`} />;
    }

    if (isPending || !user) {
        return <Loader />;
    }

    return (
        <div className="profile">
            <div className="mobile item-header">
                <p className="title-block">
                    <span className="back-button" onClick={() => void navigate(-1)} />
                    Profile: {user.id}
                </p>
            </div>
            <div className="main-details">
                <span className="name">{user.id}</span>
                <span className="right">{user.karma} ★</span>
                <p className="age">Created {user.created}</p>
            </div>
            {user.about && (
                <div className="other-details">
                    <p dangerouslySetInnerHTML={{ __html: user.about }} />
                </div>
            )}
        </div>
    );
}
