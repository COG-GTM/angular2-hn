import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import type { User } from '../models';
import { fetchUser } from '../services/hackernewsApi';
import ErrorMessage from '../shared/ErrorMessage';
import Loader from '../shared/Loader';
import { sanitizedHtml } from '../shared/sanitize';
import './UserProfile.scss';

export default function UserProfile() {
    const { id = '' } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        fetchUser(id, controller.signal).then(setUser, () => {
            if (!controller.signal.aborted) setErrorMessage(`Could not load user ${id}.`);
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
                    {` Profile: ${user.id} `}
                </p>
            </div>
            <div className="main-details">
                <span className="name">{user.id}</span>
                <span className="right">{user.karma} ★</span>
                <p className="age">Created {user.created}</p>
            </div>
            {user.about && (
                <div className="other-details">
                    <p dangerouslySetInnerHTML={sanitizedHtml(user.about)}></p>
                </div>
            )}
        </div>
    );
}
