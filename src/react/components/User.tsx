import { KeyboardEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ErrorMessage from './ErrorMessage';
import Loader from './Loader';
import { fetchUser } from '../api/hackernews';
import { User as UserModel } from '../models/user';
import './User.scss';

export default function User() {
    const { id } = useParams<'id'>();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserModel | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let ignore = false;

        setErrorMessage('');
        if (!id) {
            return;
        }

        fetchUser(id)
            .then(nextUser => {
                if (ignore) {
                    return;
                }

                setUser(nextUser);
            })
            .catch(() => {
                if (ignore) {
                    return;
                }

                setErrorMessage('Could not load user ' + id + '.');
            });

        return () => {
            ignore = true;
        };
    }, [id]);

    function goBack() {
        navigate(-1);
    }

    function handleBackKeyDown(event: KeyboardEvent<HTMLSpanElement>) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            goBack();
        }
    }

    if (!user) {
        return (
            <>
                {!errorMessage && <Loader />}
                {errorMessage && <ErrorMessage message={errorMessage} />}
            </>
        );
    }

    return (
        <div className="profile">
            <div className="mobile item-header">
                <p className="title-block">
                    <span
                        className="back-button"
                        role="button"
                        tabIndex={0}
                        onClick={goBack}
                        onKeyDown={handleBackKeyDown}
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
                    <p dangerouslySetInnerHTML={{ __html: user.about }}></p>
                </div>
            )}
        </div>
    );
}
