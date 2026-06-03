import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Comment } from '../../types/Comment';

interface CommentComponentProps {
  comment: Comment;
}

export function CommentComponent({ comment }: CommentComponentProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (comment.deleted) {
    return (
      <div className="comment" style={{ marginLeft: `${comment.level * 20}px` }}>
        <div className="deleted-meta">[deleted] | Comment Deleted</div>
      </div>
    );
  }

  return (
    <div className="comment" style={{ marginLeft: `${comment.level * 20}px` }}>
      <div className="comment-header">
        <button className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
          [{collapsed ? '+' : '-'}]
        </button>{' '}
        <Link to={`/user/${comment.user}`}>{comment.user}</Link>{' '}
        <span className="time">{comment.time_ago}</span>
      </div>

      {!collapsed && (
        <>
          <div
            className="comment-content"
            dangerouslySetInnerHTML={{ __html: comment.content }}
          />
          {comment.comments &&
            comment.comments.map(child => (
              <CommentComponent key={child.id} comment={child} />
            ))}
        </>
      )}
    </div>
  );
}
