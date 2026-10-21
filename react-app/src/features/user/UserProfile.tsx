import type { KeyboardEvent } from 'react';
import { useNavigate, useParams } from 'react-router';

import { useUser } from '../../shared/api';
import { ErrorMessage, Loader } from '../../shared/components';
import { sanitizeHtml, useScrollToTop } from '../../shared/utils';
import './UserProfile.scss';

/** Port of Angular `app-user` (`/user/:id`). */
export function UserProfile() {
    const { id } = useParams<{ id: string }>();
    useScrollToTop(id);
    const navigate = useNavigate();
    const { data: user, isPending, isError } = useUser(id);

    const goBack = () => void navigate(-1);
    const onBackKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            goBack();
        }
    };

    return (
        <div className="user-profile">
            {isPending ? <Loader /> : null}
            {isError ? <ErrorMessage message={'Could not load user ' + (id ?? '') + '.'} /> : null}
            {user ? (
                <div className="profile">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span
                                className="back-button"
                                role="button"
                                tabIndex={0}
                                aria-label="Back"
                                onClick={goBack}
                                onKeyDown={onBackKeyDown}
                            ></span>
                            Profile: {user.id}
                        </p>
                    </div>
                    <div className="main-details">
                        <span className="name">{user.id}</span>
                        <span className="right">{user.karma} ★</span>
                        <p className="age">Created {user.created}</p>
                    </div>
                    {user.about ? (
                        <div className="other-details">
                            <p dangerouslySetInnerHTML={{ __html: sanitizeHtml(user.about) }}></p>
                        </div>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}
