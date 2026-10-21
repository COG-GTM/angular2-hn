import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { fetchUser } from '../../api/hackernews';
import ErrorMessage from '../../components/shared/ErrorMessage';
import Loader from '../../components/shared/Loader';
import type { User } from '../../models';
import './UserPage.scss';

type UserState = { id: string; user: User | null; errorMessage: string };

/** Port of src/app/user/user.component. */
export default function UserPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState<UserState | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchUser(id, controller.signal).then(
      (user) => setState({ id, user, errorMessage: '' }),
      () => {
        if (!controller.signal.aborted) {
          setState({ id, user: null, errorMessage: `Could not load user ${id}.` });
        }
      }
    );
    return () => controller.abort();
  }, [id]);

  const current = state?.id === id ? state : null;
  const user = current?.user ?? null;
  const errorMessage = current?.errorMessage ?? '';

  return (
    <div className="app-user">
      {!user && !errorMessage && <Loader />}
      {!user && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

      {user && (
        <div className="profile">
          <div className="mobile item-header">
            <p className="title-block">
              <span className="back-button" onClick={() => navigate(-1)}></span>
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
              <p dangerouslySetInnerHTML={{ __html: user.about }}></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
