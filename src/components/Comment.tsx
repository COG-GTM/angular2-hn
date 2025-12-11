import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Comment as CommentType } from '../models';
import './Comment.scss';

interface CommentProps {
  comment: CommentType;
}

export function Comment({ comment }: CommentProps) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  if (comment.deleted) {
    return <div className="deleted">[deleted]</div>;
  }

  return (
    <div className="comment-tree">
      <div className="comment-meta">
        <span className="collapse" onClick={toggleCollapse}>
          [{collapsed ? '+' : '-'}]
        </span>
        <Link to={`/user/${comment.user}`} className="comment-user">
          {comment.user}
        </Link>
        <span className="time">{comment.time_ago}</span>
      </div>
      {!collapsed && (
        <>
          <div className="comment-text" dangerouslySetInnerHTML={{ __html: comment.content }} />
          {comment.comments && comment.comments.length > 0 && (
            <ul className="nested-comments">
              {comment.comments.map((nestedComment) => (
                <li key={nestedComment.id}>
                  <Comment comment={nestedComment} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
