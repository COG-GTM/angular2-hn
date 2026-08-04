import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { User } from '../../models';
import { fetchUser } from '../../services/hackernewsApi';
import ErrorMessage from '../shared/ErrorMessage';
import Loader from '../shared/Loader';
import './UserProfile.scss';

export default function UserProfile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        setUser(null);
        setErrorMessage('');

        fetchUser(id ?? '', controller.signal)
            .then(setUser)
            .catch((error: Error) => {
                if (error.name !== 'AbortError') {
                    setErrorMessage(`Could not load user ${id}.`);
                }
            });

        return () => controller.abort();
    }, [id]);

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
