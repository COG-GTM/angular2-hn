import { useNavigate, useParams } from 'react-router';

import { ErrorMessage, Loader } from '../shared/components';
import { useUser } from '../shared/hooks';
import { sanitizeHtml } from '../shared/utils';
import './User.scss';

export function User() {
    const { id = '' } = useParams();
    const navigate = useNavigate();
    const { data: user, isError } = useUser(id);
    const goBack = () => navigate(-1);

    if (isError) {
        return <ErrorMessage message={`Could not load user ${id}.`} />;
    }
    if (!user) {
        return <Loader />;
    }

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
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                goBack();
                            }
                        }}
                    ></span>
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
                    <p dangerouslySetInnerHTML={{ __html: sanitizeHtml(user.about) }}></p>
                </div>
            )}
        </div>
    );
}
