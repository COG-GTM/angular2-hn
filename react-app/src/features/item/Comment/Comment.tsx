import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import type { Comment as CommentModel } from '../../../api/types';
import './Comment.scss';

export function Comment({ comment }: { comment: CommentModel }) {
  const [collapse, setCollapse] = useState(false);
  const toggle = () => setCollapse(!collapse);

  if (comment.deleted) {
    return (
      <div className="hn-comment">
        <div className="deleted-meta">
          <span className="collapse">[deleted]</span> | Comment Deleted
        </div>
      </div>
    );
  }

  return (
    <div className="hn-comment">
      <div className={collapse ? 'meta meta-collapse' : 'meta'}>
        <span
          className="collapse"
          role="button"
          tabIndex={0}
          aria-expanded={!collapse}
          onClick={toggle}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              toggle();
            }
          }}
        >{`[${collapse ? '+' : '-'}]`}</span>
        <NavLink to={`/user/${comment.user}`}>{comment.user}</NavLink>
        <span className="time">{comment.time_ago}</span>
      </div>
      <div className="comment-tree">
        <div hidden={collapse}>
          <p className="comment-text" dangerouslySetInnerHTML={{ __html: comment.content }}></p>
          <ul className="subtree">
            {(comment.comments ?? []).map((subComment) => (
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
