import type { KeyboardEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useUser } from '../../shared/api';
import { ErrorMessage, Loader } from '../../shared/components';
import { sanitizeHtml, useScrollToTop } from '../../shared/utils';
import './UserProfile.scss';

/** Port of `src/app/user/user.component.*`. Route `/user/:id`. */
export function UserProfile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: user, isPending, isError } = useUser(id);
    useScrollToTop(id);

    const goBack = () => navigate(-1);
    const onBackKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            goBack();
        }
    };

    // The query is keyed on `id` without placeholder data, so while `/user/b` loads after `/user/a`
    // the page shows the loader (or b's cached profile), never a's profile.
    return (
        <div className="user-profile">
            {isPending && <Loader />}
            {isError && !user && <ErrorMessage message={`Could not load user ${id ?? ''}.`} />}
            {user && (
                <div className="profile">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span
                                className="back-button"
                                role="button"
                                tabIndex={0}
                                aria-label="Go back"
                                onClick={goBack}
                                onKeyDown={onBackKeyDown}
                            ></span>
                            Profile: {user.id}
                        </p>
                    </div>
                    <div className="main-details">
                        <span className="name">{user.id}</span> <span className="right">{user.karma} ★</span>
                        <p className="age">Created {user.created}</p>
                    </div>
                    {user.about && (
                        <div className="other-details">
                            <p dangerouslySetInnerHTML={{ __html: sanitizeHtml(user.about) }}></p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
