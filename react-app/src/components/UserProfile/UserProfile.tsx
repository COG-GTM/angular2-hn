import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { User } from '../../models/user';
import { fetchUser } from '../../services/hackernews-api';
import { Loader } from '../Loader/Loader';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import './UserProfile.scss';

export function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(false);
    window.scrollTo(0, 0);
    fetchUser(id || '')
      .then((data) => {
        if (!ignore) {
          setUser(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setError(true);
          setLoading(false);
        }
      });
    return () => { ignore = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="main-content">
        <Loader />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="main-content">
        <ErrorMessage />
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="item-header mobile">
        <span className="back-button" onClick={() => navigate(-1)}></span>
        <div className="title-block">{user.id}</div>
      </div>
      <div className="profile">
        <div className="main-details">
          <span className="name">{user.id}</span>
          <span className="right">{user.karma}</span>
        </div>
        <p className="age">Joined {user.created}</p>
        {user.about && (
          <div className="other-details" dangerouslySetInnerHTML={{ __html: user.about }} />
        )}
      </div>
    </div>
  );
}
