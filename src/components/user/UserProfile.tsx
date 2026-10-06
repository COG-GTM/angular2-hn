import { useNavigate } from 'react-router-dom';
import { useRouteId } from '../../hooks/useRouteId';
import { useUser } from '../../hooks/useUser';
import { BackButton, ErrorMessage, Loader } from '../shared';
import './UserProfile.scss';

export default function UserProfile() {
    const id = useRouteId();
    const navigate = useNavigate();
    const { data: user, isPending, isError } = useUser(id);

    if (!id || isError) {
        return <ErrorMessage message={id ? `Could not load user ${id}.` : 'Could not load user.'} />;
    }

    if (isPending) {
        return <Loader />;
    }

    return (
        <div className="profile">
            <div className="mobile item-header">
                <p className="title-block">
                    <BackButton onClick={() => navigate(-1)} />
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
