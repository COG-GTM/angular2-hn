import { useParams, useNavigate } from 'react-router-dom';

import { useUser } from '../../shared/hooks/useHackerNewsApi';
import { Loader, ErrorMessage } from '../../shared/components';
import styles from '../../styles/UserPage.module.css';

export default function UserPage() {
  const { id = '' } = useParams();
  const { user, error, loading } = useUser(id);
  const navigate = useNavigate();
  const goBack = () => navigate(-1);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <ErrorMessage errorMessage={error} />;
  }

  if (!user) {
    return null;
  }

  return (
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
  );
}
