import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useUser } from '../shared/api/hooks';
import { Loader } from '../shared/components/Loader';
import { ErrorMessage } from '../shared/components/ErrorMessage';
import { sanitizeHtml } from './sanitize-html';
import './User.scss';

/**
 * Port of the Angular `UserComponent` (lazy `/user/:id` route).
 * The live API answers a non-existent user with `null` (or a 404), so a successful
 * response without an `id` is treated as the same error the Angular template showed.
 */
export default function User() {
    const { id = '' } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data, isError, isSuccess } = useUser(id);

    const user = data && data.id ? data : undefined;
    const errorMessage = isError || (isSuccess && !user) ? `Could not load user ${id}.` : '';
    const aboutHtml = useMemo(() => (user?.about ? sanitizeHtml(user.about) : ''), [user?.about]);

    useEffect(() => {
        if (user) {
            window.scrollTo(0, 0);
        }
    }, [user]);

    return (
        <div className="app-user">
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
                            <p dangerouslySetInnerHTML={{ __html: aboutHtml }}></p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
