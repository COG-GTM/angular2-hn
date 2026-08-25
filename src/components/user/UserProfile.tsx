import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { fetchUser } from '../../api/hackernews';
import { User } from '../../models';
import { ErrorMessage } from '../shared/ErrorMessage';
import { Loader } from '../shared/Loader';
import './UserProfile.scss';

export function UserProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const controller = new AbortController();

        setUser(null);
        setErrorMessage('');

        fetchUser(String(id), controller.signal)
            .then(setUser)
            .catch((error: unknown) => {
                if (!controller.signal.aborted) {
                    setErrorMessage(`Could not load user ${id}.`);
                    console.error(error);
                }
            });

        return () => controller.abort();
    }, [id]);

    if (!user) {
        return (
            <>
                {!errorMessage && <Loader />}
                {errorMessage !== '' && <ErrorMessage message={errorMessage} />}
            </>
        );
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
