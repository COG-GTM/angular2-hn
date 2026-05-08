import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchUser } from '../../services/hackernews-api';
import type { User as UserModel } from '../../types/user';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import Loader from '../Loader/Loader';
import './User.scss';

export default function User() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserModel | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setUser(null);
    setErrorMessage('');

    fetchUser(id)
      .then((data) => {
        if (cancelled) return;
        setUser(data);
      })
      .catch(() => {
        if (cancelled) return;
        setErrorMessage(`Could not load user ${id}.`);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const goBack = () => navigate(-1);

  if (!user && !errorMessage) {
    return <Loader />;
  }

  if (!user && errorMessage) {
    return <ErrorMessage message={errorMessage} />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="profile">
      <div className="mobile item-header">
        <p className="title-block">
          <span className="back-button" onClick={goBack} />
          Profile: {user.id}
        </p>
      </div>
      <div className="main-details">
        <span className="name">{user.id}</span>
        <span className="right">{user.karma} ★</span>
        <p className="age">Created {user.created}</p>
      </div>
      {user.about ? (
        <div className="other-details">
          <p dangerouslySetInnerHTML={{ __html: user.about }} />
        </div>
      ) : null}
    </div>
  );
}
