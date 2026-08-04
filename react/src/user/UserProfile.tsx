import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ErrorMessage } from '../shared/components/ErrorMessage/ErrorMessage';
import { Loader } from '../shared/components/Loader/Loader';
import { User } from '../shared/models';
import { fetchUser } from '../shared/services/hackernewsApi';
import './UserProfile.scss';

export function UserProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const userID = id ?? '';
        let ignored = false;

        fetchUser(userID).then(
            (data) => {
                if (!ignored) {
                    setUser(data);
                }
            },
            () => {
                if (!ignored) {
                    setErrorMessage('Could not load user ' + userID + '.');
                }
            }
        );

        return () => {
            ignored = true;
        };
    }, [id]);

    return (
        <>
            {!user && !errorMessage && <Loader />}
            {!user && errorMessage !== '' && <ErrorMessage message={errorMessage} />}
            {user && (
                <div className="profile">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" onClick={() => navigate(-1)}></span> Profile: {user.id}
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
            )}
        </>
    );
}
