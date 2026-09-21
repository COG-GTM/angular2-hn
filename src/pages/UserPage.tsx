import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { fetchUser } from '../api/hackernews';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loader } from '../components/Loader';
import type { User } from '../models';
import './UserPage.scss';

export function UserPage() {
    const { id } = useParams();
    const userID = id ?? '';
    const navigate = useNavigate();
    const [user, setUser] = useState<User | undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const controller = new AbortController();

        setUser(undefined);
        setErrorMessage('');

        fetchUser(userID, controller.signal)
            .then(setUser)
            .catch(() => {
                if (!controller.signal.aborted) {
                    setErrorMessage(`Could not load user ${userID}.`);
                }
            });

        return () => controller.abort();
    }, [userID]);

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
