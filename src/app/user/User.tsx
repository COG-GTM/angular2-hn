import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ErrorMessage } from '../shared/components/error-message/ErrorMessage';
import { Loader } from '../shared/components/loader/Loader';
import { useAsync } from '../shared/hooks/useAsync';
import { fetchUser } from '../shared/services/hackernewsApi';
import { sanitizedHtml } from '../shared/utils/html';
import './User.scss';

export function User() {
  const { id = '' } = useParams();
  const navigate = useNavigate();

  const loadUser = useCallback((signal: AbortSignal) => fetchUser(id, signal), [id]);
  const { data: user, error } = useAsync(loadUser);

  return (
    <div className="user-component">
      {!user && !error && <Loader />}
      {!user && !!error && <ErrorMessage message={`Could not load user ${id}.`} />}

      {user && (
        <div className="profile">
          <div className="mobile item-header">
            <p className="title-block">
              <span className="back-button" aria-label="Back" onClick={() => navigate(-1)}></span>
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
              <p dangerouslySetInnerHTML={sanitizedHtml(user.about)} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
