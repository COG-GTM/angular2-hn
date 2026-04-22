import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { User } from '../types/user';
import { fetchUser } from '../services/hackerNewsApi';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';

export function UserPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        setUser(null);
        setErrorMessage('');
        if (id) {
            fetchUser(id, controller.signal)
                .then((data) => setUser(data))
                .catch((err) => {
                    if (err instanceof DOMException && err.name === 'AbortError') return;
                    setErrorMessage(`Could not load user ${id}.`);
                });
        }
        return () => controller.abort();
    }, [id]);

    return (
        <>
            {!user && !errorMessage && <Loader />}
            {!user && errorMessage && <ErrorMessage message={errorMessage} />}
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
                            <p dangerouslySetInnerHTML={{ __html: user.about }} />
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
