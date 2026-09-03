import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchUser } from '../api/hackernews'
import { ErrorMessage } from '../components/ErrorMessage'
import { Loader } from '../components/Loader'
import type { User as UserModel } from '../models/user'

export default function User() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState<UserModel>()
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setUser(undefined)
    setError('')
    fetchUser(id)
      .then((nextUser) => {
        if (!cancelled) setUser(nextUser)
      })
      .catch(() => {
        if (!cancelled) setError(`Could not load user ${id}.`)
      })
    return () => {
      cancelled = true
    }
  }, [id])

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
              <p dangerouslySetInnerHTML={{ __html: user.about }} />
            </div>
          )}
        </div>
      )}
    </>
  )
}
