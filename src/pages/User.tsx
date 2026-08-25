import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { fetchUser } from '../api/hackerNews';
import ErrorMessage from '../components/ErrorMessage';
import Loader from '../components/Loader';
import type { User as UserModel } from '../models/user';

import './User.scss';

export default function User() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [user, setUser] = useState<UserModel | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const controller = new AbortController();

        setUser(null);
        setErrorMessage('');

        fetchUser(id ?? '', controller.signal)
            .then(setUser)
            .catch((error: unknown) => {
                if (controller.signal.aborted) {
                    return;
                }
                console.error(error);
                setErrorMessage(`Could not load user ${id}.`);
            });

        return () => controller.abort();
    }, [id]);

    if (!user) {
        return errorMessage ? <ErrorMessage message={errorMessage} /> : <Loader />;
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
