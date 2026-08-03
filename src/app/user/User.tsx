import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ErrorMessage } from '../shared/components/error-message/ErrorMessage';
import { Loader } from '../shared/components/loader/Loader';
import { useAsyncData } from '../shared/hooks/useAsyncData';
import { fetchUser } from '../shared/services/hackernewsApi';
import './User.scss';

export function User() {
  const { id = '' } = useParams();
  const navigate = useNavigate();

  const load = useCallback((signal: AbortSignal) => fetchUser(id, signal), [id]);
  const user = useAsyncData(id, load);

  return (
    <div className="user-view">
      {user.status === 'loading' && <Loader />}
      {user.status === 'error' && <ErrorMessage message={`Could not load user ${id}.`} />}

      {user.status === 'success' && (
        <div className="profile">
          <div className="mobile item-header">
            <p className="title-block">
              <span className="back-button" onClick={() => navigate(-1)}></span>
              Profile: {user.data.id}
            </p>
          </div>
          <div className="main-details">
            <span className="name">{user.data.id}</span>
            <span className="right">{user.data.karma} ★</span>
            <p className="age">Created {user.data.created}</p>
          </div>
          {user.data.about && (
            <div className="other-details">
              <p dangerouslySetInnerHTML={{ __html: user.data.about }}></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
