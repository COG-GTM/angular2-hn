import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { fetchUser } from '../../api/hackernews';
import { ErrorMessage } from '../../components/ErrorMessage';
import { Loader } from '../../components/Loader';
import { User as UserModel } from '../../models/user';

export function User() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserModel | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!id) {
      return;
    }

    const controller = new AbortController();
    setUser(null);
    setErrorMessage('');

    fetchUser(id, controller.signal)
      .then(data => {
        if (!controller.signal.aborted) {
          setUser(data);
        }
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        if (!controller.signal.aborted) {
          setErrorMessage(`Could not load user ${id}.`);
        }
      });

    return () => controller.abort();
  }, [id]);

  if (!user) {
    return errorMessage !== '' ? <ErrorMessage message={errorMessage} /> : <Loader />;
  }

  return (
    <div className="profile">
      <div className="mobile item-header">
        <p className="title-block">
          <span className="back-button" onClick={() => window.history.back()}></span>
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
  );
}

export default User;
