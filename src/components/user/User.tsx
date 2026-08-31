import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { User as UserModel } from '../../models/user';
import { fetchUser } from '../../services/hackernewsApi';
import ErrorMessage from '../shared/ErrorMessage';
import Loader from '../shared/Loader';
import './User.scss';

export default function User() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserModel | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!id) {
            return;
        }

        let cancelled = false;
        setUser(null);
        setErrorMessage('');

        fetchUser(id)
            .then(data => {
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

    return (
        <div className="user-view">
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
                            <p dangerouslySetInnerHTML={{ __html: user.about }}></p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
