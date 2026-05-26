import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchUser } from '@/services/hackernews-api';
import { Loader } from '@/components/Loader';
import { ErrorMessage } from '@/components/ErrorMessage';
import styles from './UserPage.module.scss';

export function UserPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id!),
    enabled: !!id,
  });

  if (isLoading) return <Loader />;
  if (error) return <ErrorMessage message={`Could not load user ${id ?? ''}.`} />;
  if (!user) return null;

  return (
    <div className={styles.profile}>
      <div className={`mobile ${styles.itemHeader}`}>
        <p className={styles.titleBlock}>
          <span className="back-button" onClick={() => navigate(-1)} />
          Profile: {user.id}
        </p>
      </div>
      <div className="main-details">
        <span className="name">{user.id}</span>
        <span className="right">{user.karma} ★</span>
        <p className={styles.age}>Created {user.created}</p>
      </div>
      {user.about && (
        <div className={styles.otherDetails}>
          <p dangerouslySetInnerHTML={{ __html: user.about }} />
        </div>
      )}
    </div>
  );
}
