import { useState } from 'react';
import { NavLink } from 'react-router-dom';

import type { Comment as CommentModel } from '../../models/comment';
import { sanitize } from '../../utils/sanitize';
import './Comment.scss';

interface CommentProps {
  comment: CommentModel;
}

export default function Comment({ comment }: CommentProps) {
  const [collapse, setCollapse] = useState(false);

  if (comment.deleted) {
    return (
      <div>
        <div className="deleted-meta">
          <span className="collapse">[deleted]</span> | Comment Deleted
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={collapse ? 'meta meta-collapse' : 'meta'}>
        <span className="collapse" onClick={() => setCollapse(!collapse)}>
          [{collapse ? '+' : '-'}]
        </span>
        <NavLink
          to={`/user/${comment.user}`}
          className={({ isActive }) => (isActive ? 'active' : undefined)}
        >
          {comment.user}
        </NavLink>
        <span className="time">{comment.time_ago}</span>
      </div>
      <div className="comment-tree">
        <div hidden={collapse}>
          <p
            className="comment-text"
            dangerouslySetInnerHTML={sanitize(comment.content)}
          ></p>
          <ul className="subtree">
            {comment.comments.map((subComment) => (
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
