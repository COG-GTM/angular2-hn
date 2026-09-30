import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { User as UserModel } from '../../models';
import { fetchUser } from '../../services/hackerNewsApi';
import { sanitizeHtml } from '../../utils/sanitize';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import { Loader } from '../Loader/Loader';
import './User.scss';

export default function User() {
    const { id = '' } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserModel>();
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let cancelled = false;
        fetchUser(id).then(
            (data) => {
                if (!cancelled) setUser(data);
            },
            () => {
                if (!cancelled) setErrorMessage('Could not load user ' + id + '.');
            }
        );
        return () => {
            cancelled = true;
        };
    }, [id]);

    return (
        <app-user>
            {!user && !errorMessage && <Loader />}
            {!user && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {user && (
                <div className="profile">
                    <div className="mobile item-header">
                        <p className="title-block">
                            <span className="back-button" onClick={() => navigate(-1)}></span>
                            {` Profile: ${user.id} `}
                        </p>
                    </div>
                    <div className="main-details">
                        <span className="name">{user.id}</span>
                        <span className="right">{`${user.karma} ★`}</span>
                        <p className="age">{`Created ${user.created}`}</p>
                    </div>
                    {user.about && (
                        <div className="other-details">
                            <p dangerouslySetInnerHTML={{ __html: sanitizeHtml(user.about) }} />
                        </div>
                    )}
                </div>
            )}
        </app-user>
    );
}
