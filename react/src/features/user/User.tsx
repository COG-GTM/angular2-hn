import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { User } from '../../shared/models';
import { hackerNewsApi } from '../../shared/services/hackernews-api';
import { ErrorMessage, Loader } from '../../shared/components';

import './User.scss';

export function UserProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const userId = id ?? '';
    const [user, setUser] = useState<User | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let cancelled = false;
        setUser(null);
        setErrorMessage('');

        hackerNewsApi.fetchUser(userId).then(
            (data) => {
                if (!cancelled) {
                    setUser(data);
                }
            },
            () => {
                if (!cancelled) {
                    setErrorMessage('Could not load user ' + userId + '.');
                }
            }
        );

        return () => {
            cancelled = true;
        };
    }, [userId]);

    const goBack = () => navigate(-1);

    return (
        <div className="user">
            {!user && !errorMessage && <Loader />}
            {!user && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {user && (
                <div className="profile">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" onClick={goBack}></span>
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

export default UserProfile;
