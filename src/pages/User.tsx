import { useNavigate, useParams } from 'react-router-dom';

import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { useUser } from '../hooks/useHackerNews';

export default function User() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: user, isLoading, isError } = useUser(id ?? '');

    if (isLoading) {
        return <Loading />;
    }

    if (isError || !user) {
        return <ErrorMessage message={`Could not load user ${id}.`} />;
    }

    return (
        <div className="profile">
            <div className="mobile item-header">
                <p className="title-block">
                    <span className="back-button" onClick={() => navigate(-1)}></span>
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
                    <p dangerouslySetInnerHTML={{ __html: user.about }}></p>
                </div>
            )}
        </div>
    );
}
