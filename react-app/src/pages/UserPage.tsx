import { useNavigate, useParams } from 'react-router-dom';

import { ErrorMessage } from '../components/ErrorMessage';
import { Loader } from '../components/Loader';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchUser } from '../services/hackernewsApi';
import type { User } from '../types';
import './UserPage.scss';

export function UserPage() {
    const { id = '' } = useParams();
    const navigate = useNavigate();
    const { data: user, errorMessage } = useAsyncData<User>(
        (signal) => fetchUser(id, signal),
        `user-${id}`,
        `Could not load user ${id}.`
    );

    return (
        <>
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
        </>
    );
}

export default UserPage;
