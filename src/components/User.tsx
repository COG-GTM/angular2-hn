import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUser } from '../services/hackernews-api';
import type { User as UserType } from '../types/user';
import Loader from './shared/Loader';
import ErrorMessage from './shared/ErrorMessage';
import styles from './User.module.scss';

export default function User() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    setUser(null);
    setErrorMessage('');

    fetchUser(id)
      .then(data => setUser(data))
      .catch(() => setErrorMessage(`Could not load user ${id}.`));
  }, [id]);

  const goBack = () => navigate(-1);

  return (
    <>
      {!user && !errorMessage && <Loader />}
      {!user && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

      {user && (
        <div className={styles.profile}>
          <div className={`${styles.mobile} item-header ${styles.itemHeader}`}>
            <p className={styles.titleBlock}>
              <span className={`back-button ${styles.backButton}`} onClick={goBack}></span>
              Profile: {user.id}
            </p>
          </div>
          <div className={`main-details ${styles.mainDetails}`}>
            <span className={styles.name}>{user.id}</span>
            <span className={styles.right}>{user.karma} ★</span>
            <p className={styles.age}>Created {user.created}</p>
          </div>
          {user.about && (
            <div className={styles.otherDetails}>
              <p dangerouslySetInnerHTML={{ __html: user.about }} />
            </div>
          )}
        </div>
      )}
    </>
  );
}
