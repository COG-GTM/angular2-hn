import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUser } from '../../services/hackerNewsApi';
import Loader from '../Loader/Loader';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import type { User as UserType } from '../../types';
import './User.scss';

interface UserProfileProps {
    userId: string;
}

export default function UserProfile({ userId }: UserProfileProps) {
    const navigate = useNavigate();
    const [user, setUser] = useState<UserType | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let cancelled = false;
        fetchUser(userId)
            .then((data) => { if (!cancelled) setUser(data); })
            .catch(() => { if (!cancelled) setErrorMessage(`Could not load user ${userId}.`); });
        return () => { cancelled = true; };
    }, [userId]);

    const goBack = () => navigate(-1);

    return (
        <>
            {!user && !errorMessage && <Loader />}
            {!user && errorMessage && <ErrorMessage message={errorMessage} />}

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
                        <span className="right">{user.karma} &#9733;</span>
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
