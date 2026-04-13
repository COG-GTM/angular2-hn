import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Comment as CommentModel } from '../models/comment';
import './Comment.scss';

interface CommentProps {
  comment: CommentModel;
}

const Comment: React.FC<CommentProps> = ({ comment }) => {
  const [collapse, setCollapse] = useState(false);

  if (comment.deleted) {
    return (
      <div className="comment-component">
        <div className="deleted-meta">
          <span className="collapse">[deleted]</span> | Comment Deleted
        </div>
      </div>
    );
  }

  return (
    <div className="comment-component">
      <div className={`meta${collapse ? ' meta-collapse' : ''}`}>
        <span className="collapse" onClick={() => setCollapse(!collapse)}>
          [{collapse ? '+' : '-'}]
        </span>{' '}
        <Link to={`/user/${comment.user}`}>{comment.user}</Link>
        <span className="time">{comment.time_ago}</span>
      </div>
      <div className="comment-tree">
        <div style={{ display: collapse ? 'none' : 'block' }}>
          <p
            className="comment-text"
            dangerouslySetInnerHTML={{ __html: comment.content }}
          />
          {comment.comments && comment.comments.length > 0 && (
            <ul className="subtree">
              {comment.comments.map((subComment) => (
                <li key={subComment.id}>
                  <Comment comment={subComment} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Comment;
