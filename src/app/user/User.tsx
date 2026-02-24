import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { useUser } from '../shared/hooks/useUser';
import Loader from '../shared/components/loader/Loader';
import ErrorMessage from '../shared/components/error-message/ErrorMessage';
import './user.component.scss';

const User: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user, error } = useUser(id || '');
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    const goBack = () => {
        navigate(-1);
    };

    return (
        <>
            {!user && !error && <Loader />}
            {!user && error && <ErrorMessage message={error} />}

            {user && (
                <div className="profile">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" onClick={goBack}></span>
                            Profile: {user.id}
                        </p>
                    </div>
                    <div className="main-details">
                        <span className="name">{user.id}</span>
                        <span className="right">{user.karma} &#9733;</span>
                        <p className="age">Created {user.created}</p>
                    </div>
                    {user.about && (
                        <div className="other-details">
                            <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(user.about) }} />
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default User;
