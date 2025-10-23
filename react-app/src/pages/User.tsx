import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User as UserType } from '../types/user';
import { hackerNewsAPIService } from '../services/hackernews-api.service';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';

export function User() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!id) return;

    setUser(null);
    setErrorMessage('');

    hackerNewsAPIService
      .fetchUser(id)
      .then((fetchedUser) => {
        setUser(fetchedUser);
      })
      .catch(() => {
        setErrorMessage(`Could not load user ${id}.`);
      });
  }, [id]);

  const goBack = () => {
    navigate(-1);
  };

  if (!user && !errorMessage) {
    return <Loader />;
  }

  if (!user && errorMessage) {
    return <ErrorMessage message={errorMessage} />;
  }

  if (!user) return null;

  return (
    <div className="profile p-4 max-w-4xl mx-auto">
      <div className="mobile item-header block md:hidden mb-4">
        <div className="title-block">
          <button
            className="back-button inline-block mr-2 text-blue-600 hover:underline"
            onClick={goBack}
          >
            ← Back
          </button>
          <span className="text-lg font-semibold">Profile: {user.id}</span>
        </div>
      </div>

      <div className="main-details bg-gray-100 dark:bg-gray-800 p-4 rounded mb-4">
        <span className="name text-xl font-bold">{user.id}</span>
        <span className="right float-right text-lg">{user.karma} ★</span>
        <p className="age text-sm text-gray-600 dark:text-gray-400 mt-2">
          Created {user.created}
        </p>
      </div>

      {user.about && (
        <div className="other-details">
          <p dangerouslySetInnerHTML={{ __html: user.about }} />
        </div>
      )}
    </div>
  );
}
