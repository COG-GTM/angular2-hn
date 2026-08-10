import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { fetchUser } from '../shared/services/hackernews-api.service';
import { User } from '../shared/models/user';
import { sanitizedHtml } from '../shared/services/sanitize';
import Loader from '../shared/components/loader/loader.component';
import ErrorMessage from '../shared/components/error-message/error-message.component';
import './user.component.scss';

export default function UserProfile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let cancelled = false;
        setUser(undefined);
        setErrorMessage('');

        fetchUser(id)
            .then(data => {
                if (!cancelled) {
                    setUser(data);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setErrorMessage('Could not load user ' + id + '.');
                }
            });

        return () => {
            cancelled = true;
        };
    }, [id]);

    return (
        <div className="user-page">
            {!user && !errorMessage && <Loader />}
            {!user && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

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
                            <p dangerouslySetInnerHTML={sanitizedHtml(user.about)}></p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
