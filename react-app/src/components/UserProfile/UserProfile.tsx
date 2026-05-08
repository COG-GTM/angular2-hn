import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User } from '../../models/user';
import { fetchUser } from '../../services/hackernews-api';
import Loader from '../Loader/Loader';
import './UserProfile.scss';

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await fetchUser(id as string);
        if (active) {
          setUser(data);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  const goBack = () => {
    navigate(-1);
  };

  if (loading) return <div className="user-wrapper"><Loader /></div>;
  if (error) return <div className="user-wrapper"><div className="error-message">Error: {error}</div></div>;
  if (!user) return null;

  return (
    <div className="user-wrapper">
      <div className="user-header">
        <span className="back-button" onClick={goBack}></span>
        <h2>{user.id}</h2>
      </div>
      <div className="user-details">
        <div className="main-details">
          <div className="detail-row">
            <span className="name">Joined: </span>
            <span className="right">{user.created}</span>
          </div>
          <div className="detail-row">
            <span className="name">Karma: </span>
            <span className="right">{user.karma}</span>
          </div>
        </div>
        {user.about && (
          <div className="user-about">
            <div
              className="about-content"
              dangerouslySetInnerHTML={{ __html: user.about }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
