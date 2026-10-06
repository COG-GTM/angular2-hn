// Ported from src/app/user/user.component.{ts,html}
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchUser } from '../../api/hn';
import { ErrorMessage } from '../../components/ErrorMessage';
import { Loader } from '../../components/Loader';
import type { User } from '../../types';
import { sanitizeHtml } from './sanitizeHtml';
import './UserPage.scss';

type State = { status: 'loading' } | { status: 'error' } | { status: 'success'; user: User };

export default function UserPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });
    fetchUser(id, controller.signal)
      .then((user) => setState({ status: 'success', user }))
      .catch((err: unknown) => {
        if ((err as Error)?.name === 'AbortError') return;
        setState({ status: 'error' });
      });
    return () => controller.abort();
  }, [id]);

  if (state.status === 'loading') return <Loader />;
  if (state.status === 'error') return <ErrorMessage message={`Could not load user ${id}.`} />;

  const { user } = state;
  return (
    <div className="profile">
      <div className="mobile item-header">
        <p className="title-block">
          <span
            className="back-button"
            role="button"
            tabIndex={0}
            aria-label="Back"
            onClick={() => navigate(-1)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate(-1);
              }
            }}
          ></span>
          Profile: {user.id}
        </p>
      </div>
      <div className="main-details">
        <span className="name">{user.id}</span>
        <span className="right">{user.karma} ★</span>
        <p className="age">Created {user.created}</p>
      </div>
      {user.about && (
        <div className="other-details">
          <p dangerouslySetInnerHTML={{ __html: sanitizeHtml(user.about) }}></p>
        </div>
      )}
    </div>
  );
}
