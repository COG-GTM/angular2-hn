import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchUser } from '../../services/hackerNewsApi';
import { User } from '../../types/User';
import Loader from '../Loader/Loader';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import './UserProfile.scss';

function UserProfile() {
    const { id } = useParams<{ id: string }>();
    const [user, setUser] = useState<User | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let cancelled = false;
        setUser(null);
        setErrorMessage('');
        if (id) {
            fetchUser(id)
                .then((data) => {
                    if (!cancelled) {
                        setUser(data);
                    }
                })
                .catch(() => {
                    if (!cancelled) {
                        setErrorMessage('Could not load user ' + id + '.');
                    }
                });
        }
        return () => { cancelled = true; };
    }, [id]);

    const goBack = () => {
        window.history.back();
    };

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

export default UserProfile;
