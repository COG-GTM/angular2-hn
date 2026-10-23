import type { KeyboardEvent } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { fetchUser } from '../../services';
import { ErrorMessage, Loader } from '../../components';
import { useFetch } from '../../hooks/useFetch';
import { sanitizeHtml, useScrollToTop } from '../../utils';
import './UserPage.scss';

/** Port of src/app/user (`UserComponent`). Rendered (lazily) at `/user/:id`. */
export function UserPage() {
    const { id = '' } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    // The location key makes every history entry refetch (Angular re-subscribed on each navigation).
    const state = useFetch((signal) => fetchUser(id, signal), `${id}\n${location.key}`);
    useScrollToTop(id);

    if (state.status === 'loading') return <Loader />;
    if (state.status === 'error') return <ErrorMessage message={`Could not load user ${id}.`} />;

    const user = state.data;
    const goBack = () => navigate(-1);
    const onBackKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            goBack();
        }
    };

    return (
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
                    ></span>{' '}
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
                    <p dangerouslySetInnerHTML={{ __html: sanitizeHtml(user.about) }} />
                </div>
            )}
        </div>
    );
}
