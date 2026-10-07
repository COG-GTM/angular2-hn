import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Comment as CommentData } from '../types/Comment'
import './Comment.scss'

export default function Comment({ comment }: { comment: CommentData }) {
  const [collapse, setCollapse] = useState(false)

  return (
    <div className="app-comment">
      {!comment.deleted ? (
        <>
          <div className={`meta${collapse ? ' meta-collapse' : ''}`}>
            <span className="collapse" onClick={() => setCollapse((current) => !current)}>
              [{collapse ? '+' : '-'}]
            </span>
            <Link to={`/user/${comment.user}`}>{comment.user}</Link>
            <span className="time">{comment.time_ago}</span>
          </div>
          <div className="comment-tree">
            <div hidden={collapse}>
              <p className="comment-text" dangerouslySetInnerHTML={{ __html: comment.content }} />
              <ul className="subtree">
                {comment.comments.map((subComment) => (
                  <li key={subComment.id}><Comment comment={subComment} /></li>
                ))}
              </ul>
            </div>
          </div>
        </>
      ) : (
        <div className="deleted-meta">
          <span className="collapse">[deleted]</span> | Comment Deleted
        </div>
      )}
    </div>
  )
}
