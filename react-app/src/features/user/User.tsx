import { useNavigate, useParams } from 'react-router-dom';
import { fetchUser } from '../../api/hn';
import { useAsync } from '../../api/useAsync';
import { ErrorMessage } from '../../shared/ErrorMessage/ErrorMessage';
import { Loader } from '../../shared/Loader/Loader';
import { sanitizeHtml } from '../../utils/sanitizeHtml';
import './User.scss';

export default function User() {
  const { id = '' } = useParams();
  // Remount per id so a previous profile (or its error) never renders under the new id.
  return <UserProfile key={id} id={id} />;
}

function UserProfile({ id }: { id: string }) {
  const navigate = useNavigate();
  const { data: user, error } = useAsync(
    (signal) =>
      fetchUser(id, signal).then((u) => {
        if (!u) throw new Error(`User not found: ${id}`);
        return u;
      }),
    [id]
  );

  const goBack = () => navigate(-1);

  return (
    <div className="hn-user">
      {!user && !error && <Loader />}
      {!user && error && <ErrorMessage message={`Could not load user ${id}.`} />}

      {user && (
        <div className="profile">
          <div className="mobile item-header">
            <p className="title-block">
              <span
                className="back-button"
                role="button"
                tabIndex={0}
                aria-label="Back"
                onClick={goBack}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    goBack();
                  }
                }}
              ></span>
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
              <p dangerouslySetInnerHTML={{ __html: sanitizeHtml(user.about) }}></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
