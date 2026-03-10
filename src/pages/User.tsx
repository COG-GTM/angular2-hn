import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUser } from '../services/hackernews-api';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import type { User as UserType } from '../types/user';
import '../styles/User.scss';

export default function UserPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserType | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [fetchedId, setFetchedId] = useState('');

    const loading = fetchedId !== (id ?? '') || (!user && !errorMessage);

    useEffect(() => {
        if (!id) return;
        let cancelled = false;
        fetchUser(id)
            .then((data) => {
                if (!cancelled) {
                    setUser(data);
                    setErrorMessage('');
                    setFetchedId(id);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setUser(null);
                    setErrorMessage('Could not load user ' + id + '.');
                    setFetchedId(id);
                }
            });

        return () => { cancelled = true; };
    }, [id]);

    const goBack = () => {
        navigate(-1);
    };

    return (
        <div className="user-page">
            {loading && <Loader />}
            {!loading && !user && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {!loading && user && (
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
