import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Comment } from '../../models/comment';
import './Comment.scss';

interface CommentProps {
  comment: Comment;
}

export default function CommentComponent({ comment }: CommentProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (comment.deleted) return null;

  return (
    <div className="comment-item">
      <div className={`meta${collapsed ? ' meta-collapse' : ''}`}>
        <span className="collapse" onClick={() => setCollapsed(!collapsed)}>
          [{collapsed ? '+' : '-'}]
        </span>{' '}
        <Link to={`/user/${comment.user}`}>{comment.user}</Link>{' '}
        <span className="time">{comment.time_ago}</span>
      </div>
      <div className="comment-tree" style={{ display: collapsed ? 'none' : 'block' }}>
        <p
          className="comment-text"
          dangerouslySetInnerHTML={{ __html: comment.content }}
        />
        {comment.comments && comment.comments.length > 0 && (
          <ul className="subtree">
            {comment.comments.map((subComment) => (
              <li key={subComment.id}>
                <CommentComponent comment={subComment} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
