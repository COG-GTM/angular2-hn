import { useNavigate, useParams } from 'react-router';

import { ErrorMessage } from '../shared/components/ErrorMessage';
import { Loader } from '../shared/components/Loader';
import { sanitizeHtml } from '../shared/utils/sanitize';
import { useUser } from './useUser';
import './User.scss';

export default function User() {
    const { id = '' } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: user, isError } = useUser(id);

    if (!user) {
        return (
            <div className="app-user">
                {isError ? <ErrorMessage message={`Could not load user ${id}.`} /> : <Loader />}
            </div>
        );
    }

    return (
        <div className="app-user">
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
                        <p dangerouslySetInnerHTML={sanitizeHtml(user.about)}></p>
                    </div>
                )}
            </div>
        </div>
    );
}
