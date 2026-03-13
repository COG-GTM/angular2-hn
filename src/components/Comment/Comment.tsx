import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Comment as CommentType } from '../../types/comment';
import './Comment.scss';

export function Comment({ comment }: { comment: CommentType }) {
  const [collapsed, setCollapsed] = useState(false);

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
      <div className={`meta${collapsed ? ' meta-collapse' : ''}`}>
        <span className="collapse" onClick={() => setCollapsed(!collapsed)}>[{collapsed ? '+' : '-'}]</span>{' '}
        <Link to={`/user/${comment.user}`}>{comment.user}</Link>
        <span className="time">{comment.time_ago}</span>
      </div>
      <div className="comment-tree">
        {!collapsed && (
          <div>
            <p className="comment-text" dangerouslySetInnerHTML={{ __html: comment.content }}></p>
            <ul className="subtree">
              {comment.comments?.map(subComment => (
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
}
