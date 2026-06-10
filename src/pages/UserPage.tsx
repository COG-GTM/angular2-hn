import { useParams, useNavigate } from 'react-router-dom';
import { User } from '../models/user';
import { fetchUser, useApiFetch } from '../hooks/useHackerNewsApi';
import Loader from '../components/shared/Loader';
import ErrorMessage from '../components/shared/ErrorMessage';
import './UserPage.scss';

export default function UserPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const userID = id ?? '';

    const { data: user, error } = useApiFetch<User>(
        () => fetchUser(userID),
        [userID],
        `Could not load user ${userID}.`,
    );

    return (
        <>
            {!user && !error && <Loader />}
            {!user && error !== '' && <ErrorMessage message={error} />}

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
