import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Comment as CommentModel } from '../../models/comment';
import './Comment.scss';

interface CommentProps {
  comment: CommentModel;
}

export function CommentItem({ comment }: CommentProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (comment.deleted) {
    return (
      <div className="deleted-meta">
        [deleted]
      </div>
    );
  }

  return (
    <div>
      <div className={collapsed ? 'meta meta-collapse' : 'meta'}>
        <span className="collapse" onClick={() => setCollapsed(!collapsed)}>
          [{collapsed ? '+' : '-'}]
        </span>
        {' '}
        <Link to={`/user/${comment.user}`}>{comment.user}</Link>
        <span className="time"> {comment.time_ago}</span>
      </div>
      {!collapsed && (
        <>
          <div
            className="comment-text"
            dangerouslySetInnerHTML={{ __html: comment.content }}
          />
          {comment.comments && comment.comments.length > 0 && (
            <div className="comment-tree">
              <ul className="subtree">
                {comment.comments.map((child) => (
                  <li key={child.id}>
                    <CommentItem comment={child} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
