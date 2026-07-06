import { useNavigate, useParams } from 'react-router-dom';

import { fetchUser } from '../api/hnApi';
import { useFetch } from '../hooks/useFetch';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';
import './User.scss';

export default function User() {
  const { id } = useParams();
  const userID = id ?? '';
  const navigate = useNavigate();

  const { data: user, error } = useFetch(
    () => fetchUser(userID),
    [userID],
    `Could not load user ${userID}.`
  );

  const goBack = () => navigate(-1);

  return (
    <>
      {!user && !error && <Loader />}
      {!user && error !== '' && <ErrorMessage message={error} />}

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
              <p dangerouslySetInnerHTML={{ __html: user.about }}></p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
