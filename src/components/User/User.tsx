import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { fetchUser } from '../../api/hackerNews';
import { User as UserModel } from '../../models/user';
import Loader from '../Loader/Loader';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
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

        const controller = new AbortController();

        fetchUser(id, controller.signal)
            .then((data) => setUser(data))
            .catch((error) => {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }
                setErrorMessage('Could not load user ' + id + '.');
            });

        return () => controller.abort();
    }, [id]);

    if (!user && !errorMessage) {
        return <Loader />;
    }

    if (!user && errorMessage) {
        return <ErrorMessage message={errorMessage} />;
    }

    if (!user) {
        return null;
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
