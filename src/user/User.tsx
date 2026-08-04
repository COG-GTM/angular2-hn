import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import ErrorMessage from '../shared/components/error-message/ErrorMessage';
import Loader from '../shared/components/loader/Loader';
import { User as UserModel } from '../shared/models';
import { fetchUser, isAbortError } from '../shared/services/hackernews-api';

import './User.scss';

interface UserState {
    id: string;
    user: UserModel | null;
    errorMessage: string;
}

export default function User() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [state, setState] = useState<UserState | null>(null);

    useEffect(() => {
        if (!id) {
            return;
        }

        const controller = new AbortController();

        fetchUser(id, controller.signal)
            .then((data) => setState({ id, user: data, errorMessage: '' }))
            .catch((error: unknown) => {
                if (!isAbortError(error)) {
                    setState({ id, user: null, errorMessage: `Could not load user ${id}.` });
                }
            });

        return () => controller.abort();
    }, [id]);

    const loaded = state && state.id === id ? state : null;
    const user = loaded?.user ?? null;
    const errorMessage = loaded?.errorMessage ?? '';

    const goBack = () => navigate(-1);

    if (!user) {
        return errorMessage !== '' ? <ErrorMessage message={errorMessage} /> : <Loader />;
    }

    return (
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
                    <p dangerouslySetInnerHTML={{ __html: user.about }}></p>
                </div>
            )}
        </div>
    );
}
