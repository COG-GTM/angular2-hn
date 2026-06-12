import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUser } from '../../api/hn-api';
import { Loader } from '../shared/Loader';
import { ErrorMessage } from '../shared/ErrorMessage';
import type { User } from '../../models/types';
import '../../styles/UserProfile.scss';

export function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const requestRef = useRef(0);

  useEffect(() => {
    if (!id) return;
    const requestId = ++requestRef.current;
    let cancelled = false;

    fetchUser(id)
      .then(data => {
        if (!cancelled && requestId === requestRef.current) {
          setUser(data);
          setErrorMessage('');
        }
      })
      .catch(() => {
        if (!cancelled && requestId === requestRef.current) {
          setUser(null);
          setErrorMessage(`Could not load user ${id}.`);
        }
      });

    return () => { cancelled = true; };
  }, [id]);

  const goBack = () => navigate(-1);

  return (
    <div className="user-profile">
      {!user && !errorMessage && <Loader />}
      {!user && errorMessage !== '' && <ErrorMessage message={errorMessage} />}

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
            <span className="right">{user.karma} ★</span>
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
