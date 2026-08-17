import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loader } from '../components/Loader';
import type { User } from '../models';
import { fetchUser } from '../services/hackernewsApi';

export function UserProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
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

    if (!user) {
        return errorMessage === '' ? <Loader /> : <ErrorMessage message={errorMessage} />;
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
