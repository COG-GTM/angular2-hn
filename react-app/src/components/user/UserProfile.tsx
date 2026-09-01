import { useNavigate, useParams } from 'react-router-dom';

import { useUser } from '../../hooks/useHackerNews';
import ErrorMessage from '../shared/ErrorMessage';
import Loader from '../shared/Loader';
import styles from './UserProfile.module.scss';

export default function UserProfile() {
    const { id = '' } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: user, isPending, isError } = useUser(id);

    if (isError) {
        return <ErrorMessage message={`Could not load user ${id}.`} />;
    }

    if (isPending || !user) {
        return <Loader />;
    }

    return (
        <div className={styles.profile}>
            <div className={`${styles.mobile} item-header`}>
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
