import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { fetchUser } from '../../api/hackernews';
import '../../app/user/user.component.scss';
import { User } from '../models/user';
import { content, host } from '../scope';
import { sanitizeHtml } from '../shared/sanitize';
import { ErrorMessage } from '../shared/ErrorMessage';
import { Loader } from '../shared/Loader';

const c = content('user');

export function UserProfile() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState<User | undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState('');

    const about = useMemo(() => sanitizeHtml(user?.about ?? ''), [user?.about]);

    useEffect(() => {
        let cancelled = false;

        fetchUser(id as string).then(
            loaded => {
                if (!cancelled) {
                    setUser(loaded);
                }
            },
            () => {
                if (!cancelled) {
                    setErrorMessage(`Could not load user ${id}.`);
                }
            }
        );

        return () => {
            cancelled = true;
        };
    }, [id]);

    return (
        <>
            {!user && errorMessage === '' && (
                <app-loader {...c} {...host('loader')}>
                    <Loader />
                </app-loader>
            )}
            {!user && errorMessage !== '' && (
                <app-error-message {...c} {...host('error-message')}>
                    <ErrorMessage message={errorMessage} />
                </app-error-message>
            )}

            {user && (
                <div className="profile" {...c}>
                    <div className="mobile item-header" {...c}>
                        <p className="title-block" {...c}>
                            <span className="back-button" onClick={() => navigate(-1)} {...c}></span>
                            Profile: {user.id}
                        </p>
                    </div>
                    <div className="main-details" {...c}>
                        <span className="name" {...c}>
                            {user.id}
                        </span>
                        <span className="right" {...c}>
                            {user.karma} ★
                        </span>
                        <p className="age" {...c}>
                            Created {user.created}
                        </p>
                    </div>
                    {user.about && (
                        <div className="other-details" {...c}>
                            <p dangerouslySetInnerHTML={{ __html: about }} {...c}></p>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
