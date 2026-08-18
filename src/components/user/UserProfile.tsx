import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchUser } from '../../api/hackerNewsApi';
import type { User } from '../../models';
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

        fetchUser(String(id), controller.signal)
            .then(setUser)
            .catch((error: unknown) => {
                if (!controller.signal.aborted) {
                    setErrorMessage(`Could not load user ${id}.`);
                }
                return error;
            });

        return () => controller.abort();
    }, [id]);

    if (!user) {
        return !errorMessage ? <Loader /> : <ErrorMessage message={errorMessage} />;
    }

    return (
        <div className="profile">
            <div className="mobile item-header">
                <p className="title-block">
                    <span className="back-button" role="button" aria-label="Go back" onClick={() => navigate(-1)} />
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
