import { useNavigate, useParams } from 'react-router-dom';

import { useUser } from '../../api/hooks';
import { ErrorMessage } from '../shared/ErrorMessage';
import { Loader } from '../shared/Loader';
import './User.scss';

export function User() {
    const { id = '' } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: user, error } = useUser(id);

    if (!user) {
        return error ? <ErrorMessage message={`Could not load user ${id}.`} /> : <Loader />;
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
