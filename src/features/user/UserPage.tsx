import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUser } from '../../hooks/useHackerNewsApi';
import { User } from '../../types/user';
import { Loader } from '../../components/Loader';
import { ErrorMessage } from '../../components/ErrorMessage';
import styles from './UserPage.module.scss';

export function UserPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [user, setUser] = useState<User | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!id) return;
        setUser(null);
        setErrorMessage('');
        fetchUser(id)
            .then(setUser)
            .catch(() => setErrorMessage(`Could not load user ${id}.`));
    }, [id]);

    const goBack = () => navigate(-1);

    return (
        <>
            {!user && !errorMessage && <Loader />}
            {!user && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

            {user && (
                <div className={styles.profile}>
                    <div className={`${styles.mobile} item-header ${styles['item-header']}`}>
                        <p className={styles['title-block']}>
                            <span
                                className={`back-button ${styles['back-button']}`}
                                onClick={goBack}
                            ></span>
                            Profile: {user.id}
                        </p>
                    </div>
                    <div className={`main-details ${styles['main-details']}`}>
                        <span className={styles.name}>{user.id}</span>
                        <span className={styles.right}>{user.karma} ★</span>
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
