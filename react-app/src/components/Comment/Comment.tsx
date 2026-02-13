import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Comment as CommentType } from '../../models/types';
import './Comment.scss';

interface CommentProps {
  comment: CommentType;
}

export default function CommentItem({ comment }: CommentProps) {
  const [collapse, setCollapse] = useState(false);

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
      <div className={`meta${collapse ? ' meta-collapse' : ''}`}>
        <span className="collapse-toggle" onClick={() => setCollapse(!collapse)}>
          [{collapse ? '+' : '-'}]
        </span>{' '}
        <Link to={`/user/${comment.user}`}>{comment.user}</Link>
        <span className="time">{comment.time_ago}</span>
      </div>
      <div className="comment-tree">
        {!collapse && (
          <div>
            <p className="comment-text" dangerouslySetInnerHTML={{ __html: comment.content }} />
            <ul className="subtree">
              {comment.comments &&
                comment.comments.map((subComment) => (
                  <li key={subComment.id}>
                    <CommentItem comment={subComment} />
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
