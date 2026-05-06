import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { type User } from '../models';
import { fetchUser } from '../services/hackernews-api';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';
import '../styles/User.scss';

export default function UserPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        setUser(null);
        setErrorMessage('');
        fetchUser(id!)
            .then(data => setUser(data))
            .catch(() => setErrorMessage('Could not load user ' + id + '.'));
    }, [id]);

    const goBack = () => navigate(-1);

    return (
        <div className="user-component">
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
        </div>
    );
}
