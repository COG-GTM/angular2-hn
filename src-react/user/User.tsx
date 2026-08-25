import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { fetchUser } from '../shared/api/hackernewsApi';
import ErrorMessage from '../shared/components/error-message/ErrorMessage';
import Loader from '../shared/components/loader/Loader';
import type { User as UserModel } from '../shared/models';
import { sanitizeHtml } from '../shared/utils/sanitizeHtml';
import './User.scss';

function User() {
    const params = useParams<{ id?: string }>();
    const userID = params.id ?? '';
    const navigate = useNavigate();
    const [user, setUser] = useState<UserModel>();
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let ignore = false;
        setErrorMessage('');

        fetchUser(userID)
            .then((nextUser) => {
                if (!ignore) {
                    setUser(nextUser);
                }
            })
            .catch(() => {
                if (!ignore) {
                    setErrorMessage(`Could not load user ${userID}.`);
                }
            });

        return () => {
            ignore = true;
        };
    }, [userID]);

    const goBack = () => {
        navigate(-1);
    };

    return (
        <>
            {!user && !errorMessage && <Loader />}
            {!user && errorMessage !== '' && <ErrorMessage message={errorMessage} />}
            {user && (
                <div className="profile">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" onClick={goBack} />
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
            )}
        </>
    );
}

export default User;
