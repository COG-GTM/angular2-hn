import './UserProfile.scss';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User } from '../shared/models/user';
import { fetchUser } from '../shared/api';
import { Loader } from '../shared/components/Loader';
import { ErrorMessage } from '../shared/components/ErrorMessage';

export function UserProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState('');

    const goBack = () => navigate(-1);

    useEffect(() => {
        if (!id) {
            return;
        }
        fetchUser(id)
            .then(setUser)
            .catch(() => setErrorMessage('Could not load user ' + id + '.'));
    }, [id]);

    return (
        <>
            {!user && !errorMessage && <Loader />}
            {!user && errorMessage !== '' && <ErrorMessage message={errorMessage} />}
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
                        <span className="right">{user.karma} ★</span>
                        <p className="age">Created {user.created}</p>
                    </div>
                    {user.about && (
                        <div className="other-details">
                            <p dangerouslySetInnerHTML={{ __html: user.about }} />
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
