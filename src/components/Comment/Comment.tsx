import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Comment.css';

export interface CommentData {
  id: number;
  level: number;
  user: string;
  time: number;
  time_ago: string;
  content: string;
  deleted: boolean;
  comments: CommentData[];
}

interface CommentProps {
  comment: CommentData;
}

const Comment: React.FC<CommentProps> = ({ comment }) => {
  const [collapsed, setCollapsed] = useState(false);

  if (comment.deleted) {
    return (
      <div>
        <div className="deleted-meta">
          <span className="collapse-toggle">[deleted]</span> | Comment Deleted
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={`meta${collapsed ? ' meta-collapse' : ''}`}>
        <span
          className="collapse-toggle"
          onClick={() => setCollapsed(!collapsed)}
        >
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
            <ul className="subtree">
              {comment.comments &&
                comment.comments.map((subComment) => (
                  <li key={subComment.id}>
                    <Comment comment={subComment} />
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Comment;
