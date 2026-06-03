import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Comment } from '../../types/Comment';
import './Comment.scss';

interface CommentComponentProps {
  comment: Comment;
}

export function CommentComponent({ comment }: CommentComponentProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (comment.deleted) {
    return (
      <div className="deleted-meta">
        <span className="collapse">[deleted]</span> | Comment Deleted
      </div>
    );
  }

  return (
    <>
      <div className={`meta${collapsed ? ' meta-collapse' : ''}`}>
        <span className="collapse" onClick={() => setCollapsed(!collapsed)}>
          [{collapsed ? '+' : '-'}]
        </span>{' '}
        <Link to={`/user/${comment.user}`}>{comment.user}</Link>
        <span className="time">{comment.time_ago}</span>
      </div>
      <div className="comment-tree">
        {!collapsed && (
          <>
            <p
              className="comment-text"
              dangerouslySetInnerHTML={{ __html: comment.content }}
            />
            {comment.comments && comment.comments.length > 0 && (
              <ul className="subtree">
                {comment.comments.map(child => (
                  <li key={child.id}>
                    <CommentComponent comment={child} />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </>
  );
}
