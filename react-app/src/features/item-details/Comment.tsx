import { useState } from 'react';
import { NavLink } from 'react-router-dom';

import type { Comment as CommentModel } from '../../models';
import './Comment.scss';

export interface CommentProps {
  comment: CommentModel;
}

/** Port of src/app/item-details/comment/comment.component (recursive). */
export default function Comment({ comment }: CommentProps) {
  const [collapse, setCollapse] = useState(false);

  if (comment.deleted) {
    return (
      <div className="app-comment">
        <div className="deleted-meta">
          <span className="collapse">[deleted]</span> | Comment Deleted
        </div>
      </div>
    );
  }

  return (
    <div className="app-comment">
      <div className={collapse ? 'meta meta-collapse' : 'meta'}>
        <span className="collapse" onClick={() => setCollapse(!collapse)}>
          [{collapse ? '+' : '-'}]
        </span>
        <NavLink to={`/user/${comment.user}`}>{comment.user}</NavLink>
        <span className="time">{comment.time_ago}</span>
      </div>
      <div className="comment-tree">
        <div hidden={collapse}>
          <p className="comment-text" dangerouslySetInnerHTML={{ __html: comment.content }} />
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
