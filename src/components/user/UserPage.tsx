import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import Loader from '../shared/Loader';
import ErrorMessage from '../shared/ErrorMessage';
import './UserPage.scss';

export default function UserPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, error, loading } = useUser(id || '');

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;
  if (!user) return <ErrorMessage message="User not found" />;

  return (
    <div className="user-page">
      <div className="user-header">
        <button className="back-btn" onClick={() => navigate(-1)}>&larr; Back</button>
      </div>
      <div className="user-profile">
        <h2 className="user-name">{user.id}</h2>
        <div className="user-details">
          <div className="user-detail-item">
            <span className="user-detail-label">Karma:</span>
            <span className="user-detail-value">{user.karma}</span>
          </div>
          <div className="user-detail-item">
            <span className="user-detail-label">Created:</span>
            <span className="user-detail-value">{user.created}</span>
          </div>
          {user.avg !== null && user.avg !== undefined && (
            <div className="user-detail-item">
              <span className="user-detail-label">Avg:</span>
              <span className="user-detail-value">{user.avg}</span>
            </div>
          )}
        </div>
        {user.about && (
          <div className="user-about">
            <h3>About</h3>
            <div dangerouslySetInnerHTML={{ __html: user.about }} />
          </div>
        )}
      </div>
    </div>
  );
}
