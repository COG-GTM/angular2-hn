import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import Loader from '../../components/Loader/Loader';
import { useAsyncData } from '../../hooks/useAsyncData';
import { User as UserModel } from '../../models';
import { fetchUser } from '../../services/hackernewsApi';
import { sanitizedHtml } from '../../utils/sanitizeHtml';
import './User.scss';

export default function User() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const load = useCallback((signal: AbortSignal) => fetchUser(id ?? '', signal), [id]);
    const { data: user, error: errorMessage } = useAsyncData<UserModel>(
        `user/${id}`,
        load,
        `Could not load user ${id}.`
    );

    return (
        <>
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
                            <p dangerouslySetInnerHTML={sanitizedHtml(user.about)}></p>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
