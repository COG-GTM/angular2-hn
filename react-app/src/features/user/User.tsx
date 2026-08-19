import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import ErrorMessage from '../../components/ErrorMessage';
import Loader from '../../components/Loader';
import type { User as UserModel } from '../../models';
import { fetchUser } from '../../services/hackernews-api';

export default function User() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserModel>();
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const controller = new AbortController();

        fetchUser(id ?? '', controller.signal).then(
            data => {
                if (!controller.signal.aborted) {
                    setUser(data);
                }
            },
            () => {
                if (!controller.signal.aborted) {
                    setErrorMessage(`Could not load user ${id}.`);
                }
            }
        );

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
                            <p dangerouslySetInnerHTML={{ __html: user.about }}></p>
                        </div>
                    )}
                </div>
            )}
        </app-user>
    );
}
