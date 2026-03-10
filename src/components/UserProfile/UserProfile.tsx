import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUser } from '../../services/hackernews-api';
import { User } from '../../types/user';
import Loader from '../Loader/Loader';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import styles from './UserProfile.module.scss';

export default function UserProfile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        setUser(null);
        setErrorMessage('');
        fetchUser(id!)
            .then((data) => {
                setUser(data);
            })
            .catch(() => {
                setErrorMessage('Could not load user ' + id + '.');
            });
    }, [id]);

    const goBack = () => {
        navigate(-1);
    };

    return (
        <>
            {!user && !errorMessage && <Loader />}
            {!user && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {user && (
                <div className={styles.profile}>
                    <div className={`${styles.mobile} ${styles['item-header']}`}>
                        <p className={styles['title-block']}>
                            <span className={styles['back-button']} onClick={goBack}></span>
                            Profile: {user.id}
                        </p>
                    </div>
                    <div className="main-details">
                        <span className="name">{user.id}</span>
                        <span className="right">{user.karma} &#9733;</span>
                        <p className={styles.age}>Created {user.created}</p>
                    </div>
                    {user.about && (
                        <div className={styles['other-details']}>
                            <p dangerouslySetInnerHTML={{ __html: user.about }} />
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
