import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User as UserModel } from '../../types/user';
import { fetchUser } from '../../api/hackernews';
import { Loader } from '../Loader/Loader';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import './User.scss';

export function User() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState<UserModel | undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let cancelled = false;
        const userID = id ?? '';
        fetchUser(userID)
            .then((data) => {
                if (!cancelled) {
                    setUser(data);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setErrorMessage('Could not load user ' + userID + '.');
                }
            });
        return () => {
            cancelled = true;
        };
    }, [id]);

    const goBack = () => navigate(-1);

    return (
        <div className="user-page">
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
        </div>
    );
}

export default User;
