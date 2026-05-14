import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Comment as CommentType } from '../types/Comment';
import './Comment.scss';

interface CommentProps {
  comment: CommentType;
}

export function Comment({ comment }: CommentProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (comment.deleted) {
    return (
      <div className="deleted-meta">
        <span className="collapse">[deleted]</span> | Comment Deleted
      </div>
    );
  }

  return (
    <div>
      <div className={`meta${collapsed ? ' meta-collapse' : ''}`}>
        <span className="collapse" onClick={() => setCollapsed(c => !c)}>
          [{collapsed ? '+' : '-'}]
        </span>{' '}
        <Link to={`/user/${comment.user}`}>{comment.user}</Link>
        <span className="time">{comment.time_ago}</span>
      </div>
      <div className="comment-tree" style={{ marginLeft: comment.level * 24 }}>
        {!collapsed && (
          <>
            <p
              className="comment-text"
              dangerouslySetInnerHTML={{ __html: comment.content }}
            />
            {comment.comments && comment.comments.length > 0 && (
              <ul className="subtree">
                {comment.comments.map(subComment => (
                  <li key={subComment.id}>
                    <Comment comment={subComment} />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
