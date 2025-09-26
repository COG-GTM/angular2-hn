import React from 'react'
import { Link } from 'react-router-dom'
import { Story } from '../../types'
import { useSettings } from '../../contexts/SettingsContext'
import Comment from '../Comment/Comment'

interface ItemDetailsProps {
  item: Story
  onGoBack: () => void
}

const ItemDetails: React.FC<ItemDetailsProps> = ({ item, onGoBack }) => {
  const { settings } = useSettings()
  const hasUrl = item.url && item.url.indexOf('http') === 0

  return (
    <div className="item-details-container">
      <button onClick={onGoBack} className="back-button">
        ← Back
      </button>
      
      <div className="item-header">
        {hasUrl ? (
          <h1>
            <a 
              href={item.url}
              target={settings.openLinkInNewTab ? '_blank' : undefined}
              rel={settings.openLinkInNewTab ? 'noopener' : undefined}
            >
              {item.title}
            </a>
          </h1>
        ) : (
          <h1>{item.title}</h1>
        )}
        
        <div className="item-meta">
          {item.points} points by{' '}
          <Link to={`/user/${item.user}`}>{item.user}</Link>
          {' '}{item.time_ago}
        </div>
      </div>

      {item.comments && item.comments.length > 0 && (
        <div className="comments-section">
          <h2>Comments</h2>
          {item.comments.map((comment) => (
            <Comment key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  )
}

export default ItemDetails
