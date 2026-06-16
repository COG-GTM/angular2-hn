import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Loader from '../../components/Loader/Loader';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import { fetchUser } from '../../services/hackerNewsApi';
import type { User } from '../../types/user';
import styles from './UserProfile.module.scss';

export default function UserProfile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        setUser(null);
        setErrorMessage('');
        if (!id) return;

        fetchUser(id)
            .then(setUser)
            .catch(() => setErrorMessage(`Could not load user ${id}.`));
    }, [id]);

    const goBack = () => navigate(-1);

    return (
        <div className={styles.userProfile}>
            {!user && !errorMessage && <Loader />}
            {!user && errorMessage && <ErrorMessage message={errorMessage} />}

            {user && (
                <div className={styles.profile}>
                    <div className={`${styles.mobile} item-header ${styles.itemHeader ?? ''}`}>
                        <p className={styles.titleBlock}>
                            <span className={`back-button ${styles.backButton ?? ''}`} onClick={goBack}></span>
                            Profile: {user.id}
                        </p>
                    </div>
                    <div className={`main-details ${styles.mainDetails}`}>
                        <span className={styles.name}>{user.id}</span>
                        <span className={styles.right}>{user.karma} &#9733;</span>
                        <p className={styles.age}>Created {user.created}</p>
                    </div>
                    {user.about && (
                        <div className={styles.otherDetails}>
                            <p dangerouslySetInnerHTML={{ __html: user.about }} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
