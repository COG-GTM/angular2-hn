import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Comment as CommentType } from '../services/hackerNewsAPI';
import './Comment.css';

interface CommentProps {
  comment: CommentType;
}

export const Comment: React.FC<CommentProps> = ({ comment }) => {
  const [collapsed, setCollapsed] = useState(false);

  if (comment.deleted) {
    return (
      <div className="deleted-comment">
        <div className="deleted-meta">
          <span className="collapse">[deleted]</span> | Comment Deleted
        </div>
      </div>
    );
  }

  return (
    <div className="comment">
      <div className={`meta ${collapsed ? 'meta-collapse' : ''}`}>
        <span className="collapse" onClick={() => setCollapsed(!collapsed)}>
          [{collapsed ? '+' : '-'}]
        </span>{' '}
        <Link to={`/user/${comment.user}`}>{comment.user}</Link>
        <span className="time">{comment.time_ago}</span>
      </div>
      <div className="comment-tree">
        {!collapsed && (
          <div>
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
        )}
      </div>
    </div>
  );
};
