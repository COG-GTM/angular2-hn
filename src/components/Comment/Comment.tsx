import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Comment as CommentType } from '../../types'

interface CommentProps {
  comment: CommentType
}

const Comment: React.FC<CommentProps> = ({ comment }) => {
  const [collapsed, setCollapsed] = useState(false)

  const toggleCollapse = () => {
    setCollapsed(!collapsed)
  }

  if (comment.deleted) {
    return (
      <div className="comment deleted">
        <div className="comment-meta">
          [deleted]
        </div>
      </div>
    )
  }

  return (
    <div className="comment" style={{ marginLeft: `${comment.level * 20}px` }}>
      <div className="comment-meta">
        <Link to={`/user/${comment.user}`} className="comment-user">
          {comment.user}
        </Link>
        <span className="comment-time">{comment.time_ago}</span>
        <button onClick={toggleCollapse} className="collapse-btn">
          {collapsed ? '[+]' : '[-]'}
        </button>
      </div>
      
      {!collapsed && (
        <>
          <div 
            className="comment-content"
            dangerouslySetInnerHTML={{ __html: comment.content }}
          />
          
          {comment.comments && comment.comments.length > 0 && (
            <div className="comment-replies">
              {comment.comments.map((reply) => (
                <Comment key={reply.id} comment={reply} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Comment
