import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { fetchUser } from '../api/hackerNewsApi';
import { Loader } from '../components/Loader/Loader';
import { ErrorMessage } from '../components/ErrorMessage/ErrorMessage';
import type { User } from '../models';
import './UserPage.scss';

export function UserPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState<{ id: string; user?: User; error?: string }>();

  useEffect(() => {
    const controller = new AbortController();
    if (id) {
      fetchUser(id, controller.signal).then(user => {
        if (!controller.signal.aborted) setResult({ id, user });
      }).catch(() => {
        if (!controller.signal.aborted) setResult({ id, error: `Could not load user ${id}.` });
      });
    }
    return () => controller.abort();
  }, [id]);

  const current = result?.id === id ? result : undefined;
  const user = current?.user;
  if (!user) return current?.error ? <ErrorMessage message={current.error} /> : <Loader />;

  return <div className="profile">
    <div className="mobile item-header">
      <p className="title-block">
        <span className="back-button" role="button" tabIndex={0} aria-label="Go back"
          onClick={() => navigate(-1)} onKeyDown={event => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              navigate(-1);
            }
          }} />
        Profile: {user.id}
      </p>
    </div>
    <div className="main-details">
      <span className="name">{user.id}</span>
      <span className="right">{user.karma} ★</span>
      <p className="age">Created {user.created}</p>
    </div>
    {user.about && <div className="other-details"><p dangerouslySetInnerHTML={{ __html: user.about }} /></div>}
  </div>;
}
