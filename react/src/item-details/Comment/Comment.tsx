import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import type { Comment as HNComment } from '../../api'
import './Comment.scss'

export function Comment({ comment }: { comment: HNComment }) {
  const [collapse, setCollapse] = useState(false)

  return (
    <div className="app-comment">
      {!comment.deleted && (
        <div>
          <div className={collapse ? 'meta meta-collapse' : 'meta'}>
            <span className="collapse" onClick={() => setCollapse(!collapse)}>
              [{collapse ? '+' : '-'}]
            </span>{' '}
            <NavLink to={`/user/${comment.user}`}>{comment.user}</NavLink>
            <span className="time">{comment.time_ago}</span>
          </div>
          <div className="comment-tree">
            <div hidden={collapse}>
              <p className="comment-text" dangerouslySetInnerHTML={{ __html: comment.content }} />
              <ul className="subtree">
                {comment.comments?.map((subComment) => (
                  <li key={subComment.id}>
                    <Comment comment={subComment} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      {comment.deleted && (
        <div>
          <div className="deleted-meta">
            <span className="collapse">[deleted]</span> | Comment Deleted
          </div>
        </div>
      )}
    </div>
  )
}
