import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { User as UserModel } from '../shared/models/models';
import { fetchUser } from '../shared/services/hackernews-api';
import { Loader } from '../shared/components/loader/Loader';
import { ErrorMessage } from '../shared/components/error-message/ErrorMessage';
import './user.scss';

export function User(): JSX.Element {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserModel | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        setUser(null);
        setErrorMessage('');
        fetchUser(String(id), controller.signal)
            .then(setUser)
            .catch((error: unknown) => {
                if (!(error instanceof DOMException && error.name === 'AbortError')) {
                    setErrorMessage(`Could not load user ${id}.`);
                }
            });
        return () => controller.abort();
    }, [id]);

    return (
        <app-user>
            {!user && !errorMessage && <Loader />}
            {!user && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {user && (
                <div className="profile">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" onClick={() => navigate(-1)}></span> Profile: {user.id}
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
            )}
        </app-user>
    );
}
