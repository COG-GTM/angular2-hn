import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorMessage } from '../components/ErrorMessage/ErrorMessage';
import { Loader } from '../components/Loader/Loader';
import { fetchUser } from '../services/hackerNewsApi';
import type { User } from '../types';
import './UserPage.scss';

export function UserPage() {
    const { id = '' } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    useEffect(() => {
        const controller = new AbortController();
        fetchUser(id, controller.signal)
            .then(setUser)
            .catch((error: unknown) => {
                if ((error as Error).name !== 'AbortError') setErrorMessage(`Could not load user ${id}.`);
            });
        return () => controller.abort();
    }, [id]);
    if (!user && !errorMessage) return <Loader />;
    if (!user) return <ErrorMessage message={errorMessage} />;
    const handleBackKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            navigate(-1);
        }
    };
    return (
        <div className="profile">
            <div className="mobile item-header">
                <p className="title-block">
                    <span
                        className="back-button"
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(-1)}
                        onKeyDown={handleBackKeyDown}
                        aria-label="Go back"
                    />
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
