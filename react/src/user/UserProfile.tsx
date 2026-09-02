import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { fetchUser } from '../api/hackernews-api';
import type { User } from '../models';
import { ErrorMessage, Loader } from '../shared/components';
import './user.scss';

interface UserResult {
    id: string;
    user: User | null;
    errorMessage: string;
}

export function UserProfile() {
    const { id = '' } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [result, setResult] = useState<UserResult | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        fetchUser(id, controller.signal)
            .then((data) => {
                if (!controller.signal.aborted) {
                    setResult({ id, user: data, errorMessage: '' });
                }
            })
            .catch(() => {
                if (!controller.signal.aborted) {
                    setResult({ id, user: null, errorMessage: `Could not load user ${id}.` });
                }
            });

        return () => controller.abort();
    }, [id]);

    const user = result?.id === id ? result.user : null;
    const errorMessage = result?.id === id ? result.errorMessage : '';

    if (!user && !errorMessage) {
        return <Loader />;
    }

    if (!user) {
        return <ErrorMessage message={errorMessage} />;
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
                    <p dangerouslySetInnerHTML={{ __html: user.about }} />
                </div>
            )}
        </div>
    );
}
