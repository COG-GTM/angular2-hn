import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchUser } from '../api/hackernews'
import { ErrorMessage } from '../components/ErrorMessage'
import { Loader } from '../components/Loader'
import type { User as UserModel } from '../models/user'
import { sanitizeHtml } from '../utils/sanitize'
import './User.scss'

export default function User() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const routeKey = id
  const [state, setState] = useState<{
    key: string
    user?: UserModel
    error?: string
  }>({ key: '' })

  useEffect(() => {
    window.scrollTo(0, 0)
    let cancelled = false
    setState({ key: routeKey })
    fetchUser(id)
      .then((nextUser) => {
        if (!nextUser || nextUser.id !== id) {
          throw new Error('Invalid user response')
        }
        if (!cancelled) setState({ key: routeKey, user: nextUser })
      })
      .catch(() => {
        if (!cancelled) {
          setState({ key: routeKey, error: `Could not load user ${id}.` })
        }
      })
    return () => {
      cancelled = true
    }
  }, [id, routeKey])

  const current = state.key === routeKey ? state : { key: routeKey }
  const { user, error } = current

  return (
    <>
      {!user && !error && <Loader />}
      {!user && error && <ErrorMessage message={error} />}
      {user && (
        <div className="profile">
          <div className="mobile item-header">
            <p className="title-block">
              <span className="back-button" onClick={() => navigate(-1)} />
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
              <p dangerouslySetInnerHTML={{ __html: sanitizeHtml(user.about) }} />
            </div>
          )}
        </div>
      )}
    </>
  )
}
