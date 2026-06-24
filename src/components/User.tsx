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
        if (!id) return;
        setUser(null);
        setErrorMessage('');
        const controller = new AbortController();

        fetchUser(id, controller.signal)
            .then((data) => {
                setUser(data);
                window.scrollTo(0, 0);
            })
            .catch((err) => {
                if (!controller.signal.aborted) {
                    setErrorMessage('Could not load user profile.');
                }
            });

        return () => controller.abort();
    }, [id]);

    const goBack = () => navigate(-1);

    return (
        <div className="main-content">
            {!user && !errorMessage && <Loader />}
            {!user && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {user && (
                <div>
                    <div className="view-top">
                        <span className="back" onClick={goBack}>
                            &#8249;
                        </span>
                    </div>
                    <div className="user-details">
                        <h4>
                            User: <span className="username">{user.id}</span>
                        </h4>
                        <p>
                            <span className="lighter">Karma: </span>
                            {user.karma}
                        </p>
                        <p>
                            <span className="lighter">Created: </span>
                            {user.created}
                        </p>
                        {user.about && (
                            <p>
                                <span className="lighter">About: </span>
                                <span dangerouslySetInnerHTML={{ __html: user.about }} />
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
