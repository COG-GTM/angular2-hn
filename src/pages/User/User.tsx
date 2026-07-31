import { useNavigate, useParams } from 'react-router';

import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { Loader } from '../../components/Loader/Loader';
import { useApiRequest } from '../../hooks/useApiRequest';
import { fetchUser } from '../../services/hackerNewsApi';

import './User.scss';

export function User() {
    const { id = '' } = useParams();
    const navigate = useNavigate();

    const { data: user, error } = useApiRequest((signal) => fetchUser(id, signal), `Could not load user ${id}.`, [id]);

    if (!user) {
        return error === '' ? <Loader /> : <ErrorMessage message={error} />;
    }

    return (
        <div className="profile">
            <div className="mobile item-header">
                <p className="title-block">
                    <span className="back-button" onClick={() => navigate(-1)} />
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
