import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUser } from '../api/hackerNews';
import { User as UserModel } from '../models/User';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';
import '../app/user/user.component.scss';

export default function User() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserModel | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        setUser(null);
        setErrorMessage('');
        const controller = new AbortController();

        fetchUser(id!, controller.signal)
            .then((data) => setUser(data))
            .catch((err) => {
                if (!controller.signal.aborted) {
                    setErrorMessage('Could not load user ' + id + '.');
                }
            });

        return () => controller.abort();
    }, [id]);

    const goBack = () => navigate(-1);

    return (
        <>
            {!user && !errorMessage && <Loader />}
            {!user && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {user && (
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
                            <p dangerouslySetInnerHTML={{ __html: user.about }} />
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
