import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useUser } from '../../api/hooks';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { Loader } from '../../components/Loader/Loader';
import './UserPage.scss';

export default function UserPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: user, isError, isSuccess } = useUser(id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // The HNPWA API answers 200 with `null` for an unknown user; treat that like a failed request.
  if (!user) {
    return isError || isSuccess ? <ErrorMessage message={`Could not load user ${id}.`} /> : <Loader />;
  }

  return (
    <div className="profile">
      <div className="mobile item-header">
        <p className="title-block">
          <span className="back-button" onClick={() => navigate(-1)}></span>
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
