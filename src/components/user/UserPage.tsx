import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/useHackerNewsApi';
import { Loader } from '../shared/Loader';
import { ErrorMessage } from '../shared/ErrorMessage';
import styles from './UserPage.module.scss';

export function UserPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, error } = useUser(id!);

  const goBack = () => {
    navigate(-1);
  };

  return (
    <>
      {!user && !error && <Loader />}
      {!user && error && <ErrorMessage message={error} />}

      {user && (
        <div className={styles.profile}>
          <div className={`${styles.mobile} ${styles['item-header']}`}>
            <p className={styles['title-block']}>
              <span className={styles['back-button']} onClick={goBack}></span>
              Profile: {user.id}
            </p>
          </div>
          <div className={styles['main-details']}>
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
