import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { User as HNUser } from '../../types';
import { fetchUser } from '../../services/hackerNewsApi';
import { Loader } from '../../components/Loader/Loader';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import './User.scss';

export function User() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<HNUser | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;
    setUser(null);
    setErrorMessage('');

    fetchUser(id)
      .then((data) => {
        if (!cancelled) {
          setUser(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setErrorMessage(`Could not load user ${id}.`);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const goBack = () => {
    navigate(-1);
  };

  if (!user && !errorMessage) {
    return <Loader />;
  }

  if (!user && errorMessage !== '') {
    return <ErrorMessage message={errorMessage} />;
  }

  if (!user) {
    return null;
  }

  return (
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
          <p dangerouslySetInnerHTML={{ __html: user.about }}></p>
        </div>
      )}
    </div>
  );
}
