import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { fetchUser } from '../../api/hackernews';
import type { User } from '../../types';
import { ErrorMessage } from '../shared/ErrorMessage';
import { Loader } from '../shared/Loader';
import styles from './UserProfile.module.scss';

export default function UserProfile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [user, setUser] = useState<User | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        setUser(null);
        setErrorMessage('');

        fetchUser(id ?? '', controller.signal)
            .then(setUser)
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }
                setErrorMessage(`Could not load user ${id}.`);
            });

        return () => controller.abort();
    }, [id]);

    if (!user) {
        return errorMessage === '' ? <Loader /> : <ErrorMessage message={errorMessage} />;
    }

    return (
        <div className={styles.profile}>
            <div className={`item-header ${styles.mobile} ${styles.itemHeader}`}>
                <p className={styles.titleBlock}>
                    <span
                        className={`back-button ${styles.backButton}`}
                        role="button"
                        tabIndex={0}
                        aria-label="Go back"
                        onClick={() => navigate(-1)}
                    ></span>
                    Profile: {user.id}
                </p>
            </div>
            <div className={`main-details ${styles.mainDetails}`}>
                <span className={`name ${styles.name}`}>{user.id}</span>
                <span className={`right ${styles.right}`}>{user.karma} ★</span>
                <p className={styles.age}>Created {user.created}</p>
            </div>
            {user.about && (
                <div className={styles.otherDetails}>
                    <p dangerouslySetInnerHTML={{ __html: user.about }}></p>
                </div>
            )}
        </div>
    );
}
