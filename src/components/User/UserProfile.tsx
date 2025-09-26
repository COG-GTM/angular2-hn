import React from 'react'
import { User } from '../../types'

interface UserProfileProps {
  user: User
  onGoBack: () => void
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onGoBack }) => {
  return (
    <div className="user-profile">
      <button onClick={onGoBack} className="back-button">
        ← Back
      </button>
      
      <div className="user-info">
        <h1>{user.id}</h1>
        <div className="user-stats">
          <p><strong>Karma:</strong> {user.karma}</p>
          <p><strong>Created:</strong> {user.created}</p>
          {user.avg && <p><strong>Average:</strong> {user.avg}</p>}
        </div>
        
        {user.about && (
          <div className="user-about">
            <h2>About</h2>
            <div dangerouslySetInnerHTML={{ __html: user.about }} />
          </div>
        )}
      </div>
    </div>
  )
}

export default UserProfile
