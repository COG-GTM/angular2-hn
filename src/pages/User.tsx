import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchUser } from '../services/api';
import type { User as UserModel } from '../types';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import '../styles/user.scss';

export default function User() {
    const { id = '' } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserModel>();
    const [errorMessage, setErrorMessage] = useState('');
    useEffect(() => {
        const controller = new AbortController();
        setUser(undefined); setErrorMessage('');
        fetchUser(id, { signal: controller.signal }).then(setUser).catch((error: Error) => {
            if (error.name !== 'AbortError') setErrorMessage(`Could not load user ${id}.`);
        });
        return () => controller.abort();
    }, [id]);
    if (!user) return <>{errorMessage ? <ErrorMessage message={errorMessage} /> : <Loader />}</>;
    return <div className="profile"><div className="mobile item-header"><p className="title-block"><button type="button" className="back-button" onClick={() => navigate(-1)} aria-label="Go back" />Profile: {user.id}</p></div><div className="main-details"><span className="name">{user.id}</span><span className="right">{user.karma} ★</span><p className="age">Created {user.created}</p></div>{user.about && <div className="other-details"><p dangerouslySetInnerHTML={{ __html: user.about }} /></div>}</div>;
}
