import { useNavigate, useParams } from 'react-router-dom'
import { useUser } from '../../api'
import { ErrorMessage } from '../../shared/components/ErrorMessage/ErrorMessage'
import { Loader } from '../../shared/components/Loader/Loader'
import './User.scss'

export function User() {
  const { id = '' } = useParams()
  const { data: user, error } = useUser(id)
  const navigate = useNavigate()

  return (
    <div className="app-user">
      {!user && !error && <Loader />}
      {!user && error && <ErrorMessage message={`Could not load user ${id}.`} />}
      {user && (
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
      )}
    </div>
  )
}
