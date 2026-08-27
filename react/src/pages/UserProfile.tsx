import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchUser } from '../api/hackerNewsApi';
import type { User } from '../types/models';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loader } from '../components/Loader';

export function UserProfile() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    setUser(null);
    setErrorMessage('');
    fetchUser(id, controller.signal).then(setUser).catch((error: unknown) => {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setErrorMessage(`Could not load user ${id}.`);
    });
    return () => controller.abort();
  }, [id]);
  return <>{!user && !errorMessage && <Loader />}{!user && errorMessage && <ErrorMessage message={errorMessage} />}{user && <div className="profile">
    <div className="mobile item-header"><p className="title-block"><button className="back-button" onClick={() => navigate(-1)} aria-label="Go back" />Profile: {user.id}</p></div>
    <div className="main-details"><span className="name">{user.id}</span><span className="right">{user.karma} ★</span><p className="age">Created {user.created}</p></div>
    {user.about && <div className="other-details"><p dangerouslySetInnerHTML={{ __html: user.about }} /></div>}
  </div>}</>;
}
