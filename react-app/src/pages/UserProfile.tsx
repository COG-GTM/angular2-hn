import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { User } from '../types';
import { fetchUser } from '../services/hackernews-api';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import './User.scss';

export function UserProfile() {
    const params = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState<User | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const controller = new AbortController();

        const userID = params.id ?? '';
        fetchUser(userID, controller.signal)
            .then((data) => setUser(data))
            .catch((error) => {
                if (
                    controller.signal.aborted ||
                    (error as Error).name === 'AbortError'
                ) {
                    return;
                }
                setErrorMessage('Could not load user ' + userID + '.');
            });

        return () => controller.abort();
    }, [params.id]);

    const goBack = () => navigate(-1);

    return (
        <div>
            {!user && !errorMessage && <Loader />}
            {!user && errorMessage !== '' && (
                <ErrorMessage message={errorMessage} />
            )}

            {user && (
                <div className="profile">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" onClick={goBack} />
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
                            <p
                                dangerouslySetInnerHTML={{ __html: user.about }}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
