import { useEffect, useReducer } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUser } from '../../hooks/useHackerNewsApi';
import type { User } from '../../models/types';
import Loader from '../shared/Loader';
import ErrorMessage from '../shared/ErrorMessage';
import './UserProfile.scss';

interface UserState {
  user: User | null;
  errorMessage: string;
}

type UserAction =
  | { type: 'loading' }
  | { type: 'success'; user: User }
  | { type: 'error'; message: string };

function userReducer(_state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'loading':
      return { user: null, errorMessage: '' };
    case 'success':
      return { user: action.user, errorMessage: '' };
    case 'error':
      return { user: null, errorMessage: action.message };
  }
}

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(userReducer, { user: null, errorMessage: '' });

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    dispatch({ type: 'loading' });

    fetchUser(id)
      .then(data => {
        if (!cancelled) dispatch({ type: 'success', user: data });
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: 'error', message: `Could not load user ${id}.` });
      });

    return () => { cancelled = true; };
  }, [id]);

  const goBack = () => navigate(-1);
  const { user, errorMessage } = state;

  return (
    <div>
      {!user && !errorMessage && <Loader />}
      {!user && errorMessage && <ErrorMessage message={errorMessage} />}

      {user && (
        <div className="profile">
          <div className="mobile item-header">
            <p className="title-block">
              <span className="back-button" onClick={goBack}></span>
              Profile: {user.id}
            </p>
          </div>
          <div className="main-details">
            <span className="name">{user.id}</span>
            <span className="right">{user.karma} &#9733;</span>
            <p className="age">Created {user.created}</p>
          </div>
          {user.about && (
            <div className="other-details">
              <p dangerouslySetInnerHTML={{ __html: user.about }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
