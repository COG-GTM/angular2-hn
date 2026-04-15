import { useState } from 'react';
import { Comment as CommentType } from '../../types/comment';
import './Comment.scss';

interface CommentProps {
  comment: CommentType;
}

export default function Comment({ comment }: CommentProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (comment.deleted) return null;

  return (
    <div className="comment">
      <div className="comment-header">
        <button className="comment-toggle" onClick={() => setCollapsed(!collapsed)}>
          [{collapsed ? '+' : '-'}]
        </button>
        <span className="comment-user">{comment.user}</span>
        <span className="comment-time">{comment.time_ago}</span>
      </div>
      {!collapsed && (
        <>
          <div
            className="comment-content"
            dangerouslySetInnerHTML={{ __html: comment.content }}
          />
          {comment.comments && comment.comments.length > 0 && (
            <div className="comment-children">
              {comment.comments.map((child) => (
                <Comment key={child.id} comment={child} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
