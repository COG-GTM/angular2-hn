import React, { useState, useEffect } from 'react';

interface Comment {
  id: number;
  level: number;
  user: string;
  time: number;
  time_ago: string;
  content: string;
  deleted: boolean;
  comments: Comment[];
}

interface CommentComponentProps {
  comment: Comment;
}

export const CommentComponent: React.FC<CommentComponentProps> = ({ comment }) => {
  const [collapse, setCollapse] = useState<boolean>(false);

  useEffect(() => {
    setCollapse(false);
  }, []);

  const handleCollapseToggle = () => {
    setCollapse(!collapse);
  };

  if (comment.deleted) {
    return (
      <div>
        <div className="deleted-meta">
          <span className="collapse">[deleted]</span> | Comment Deleted
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={`meta ${collapse ? 'meta-collapse' : ''}`}>
        <span className="collapse" onClick={handleCollapseToggle}>
          [{collapse ? '+' : '-'}]
        </span>{' '}
        <a href={`/user/${comment.user}`}>{comment.user}</a>
        <span className="time">{comment.time_ago}</span>
      </div>
      <div className="comment-tree">
        <div style={{ display: collapse ? 'none' : 'block' }}>
          <p className="comment-text" dangerouslySetInnerHTML={{ __html: comment.content }} />
          <ul className="subtree">
            {comment.comments.map((subComment) => (
              <li key={subComment.id}>
                <CommentComponent comment={subComment} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
