import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { fetchUser } from '../api/hackerNewsApi';
import type { User as UserModel } from '../models';
import { sanitizeHtml } from '../utils/sanitize';
import { ErrorMessage } from './ErrorMessage';
import { Loader } from './Loader';
import './User.scss';

export function User() {
    const { id } = useParams<{ id: string }>();
    const [user, setUser] = useState<UserModel | null>(null);
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

    const goBack = () => window.history.back();

    if (!user) {
        return errorMessage === '' ? <Loader /> : <ErrorMessage message={errorMessage} />;
    }

    return (
        <div className="profile">
            <div className="mobile item-header">
                <p className="title-block">
                    <span className="back-button" onClick={goBack}></span>
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
                    <p dangerouslySetInnerHTML={{ __html: sanitizeHtml(user.about) }}></p>
                </div>
            )}
        </div>
    );
}
