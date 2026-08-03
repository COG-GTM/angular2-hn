import { useState } from 'react';
import { NavLink } from 'react-router-dom';

import type { Comment as CommentModel } from '../../shared/models';
import './Comment.scss';

const activeClassName = ({ isActive }: { isActive: boolean }) => (isActive ? 'active' : undefined);

export function Comment({ comment }: { comment: CommentModel }) {
  const [collapse, setCollapse] = useState(false);

  if (comment.deleted) {
    return (
      <div className="comment-view">
        <div className="deleted-meta">
          <span className="collapse">[deleted]</span> | Comment Deleted
        </div>
      </div>
    );
  }

  return (
    <div className="comment-view">
      <div className={`meta${collapse ? ' meta-collapse' : ''}`}>
        <span className="collapse" onClick={() => setCollapse(!collapse)}>
          [{collapse ? '+' : '-'}]
        </span>{' '}
        <NavLink className={activeClassName} to={`/user/${comment.user}`}>
          {comment.user}
        </NavLink>
        <span className="time">{comment.time_ago}</span>
      </div>
      <div className="comment-tree">
        <div hidden={collapse}>
          <p className="comment-text" dangerouslySetInnerHTML={{ __html: comment.content }}></p>
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
  );
}
