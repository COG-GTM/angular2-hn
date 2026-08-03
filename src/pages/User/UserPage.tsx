import { useNavigate, useParams } from 'react-router-dom';

import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import Loader from '../../components/Loader/Loader';
import { fetchUser } from '../../api/hackerNewsApi';
import { useAsync } from '../../hooks/useAsync';

import './User.scss';

export default function UserPage() {
    const { id = '' } = useParams();
    const navigate = useNavigate();

    const { data: user, errorMessage } = useAsync(
        (signal) => fetchUser(id, signal),
        [id],
        `Could not load user ${id}.`
    );

    return (
        <div className="user-page">
            {!user && !errorMessage && <Loader />}
            {!user && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {user && (
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
            )}
        </div>
    );
}
