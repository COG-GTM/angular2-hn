import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { fetchUser } from '../../api/hackerNewsApi';
import { User as UserModel } from '../../models/user';
import './User.scss';

export default function User() {
    const { id } = useParams<'id'>();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserModel | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!id) {
            return;
        }

        const controller = new AbortController();
        setUser(null);
        setErrorMessage('');

        fetchUser(id, controller.signal)
            .then((data) => setUser(data))
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }
                setErrorMessage(`Could not load user ${id}.`);
            });

        return () => controller.abort();
    }, [id]);

    if (!user && !errorMessage) {
        return (
            <div className="loading-section">
                <div className="loader">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="error-section">
                <div className="skull">
                    <div className="head">
                        <div className="crack" />
                    </div>
                    <div className="mouth">
                        <div className="teeth" />
                    </div>
                </div>
                <p className="strong">{errorMessage}</p>
                <p>
                    If you are offline viewing, you&apos;ll need to visit this page with a network connection first
                    before it can work offline.
                </p>
            </div>
        );
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
