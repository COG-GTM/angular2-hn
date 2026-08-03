import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { fetchUser } from '../../shared/api/hackernews-api';
import ErrorMessage from '../../shared/components/ErrorMessage';
import Loader from '../../shared/components/Loader';
import type { User } from '../../shared/models/user';
import './UserPage.scss';

export default function UserPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let cancelled = false;
        setUser(null);
        setErrorMessage('');

        fetchUser(id ?? '')
            .then((data) => {
                if (!cancelled) {
                    setUser(data);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setErrorMessage(`Could not load user ${id}.`);
                }
            });

        return () => {
            cancelled = true;
        };
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
                    <span
                        className="back-button"
                        role="button"
                        aria-label="Go back"
                        onClick={() => navigate(-1)}
                    ></span>
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
