import { useState } from 'react';
import { Link } from 'react-router';
import type { Comment } from '../api/types';
import { HtmlContent } from './HtmlContent';
import './CommentTree.css';

/** Port of item-details/comment/comment.component; renders replies recursively. */
export function CommentTree({ comment }: { comment: Comment }) {
  const [collapsed, setCollapsed] = useState(false);

  if (comment.deleted) {
    return (
      <div className="comment">
        <div className="deleted-meta">
          <span className="collapse">[deleted]</span> | Comment Deleted
        </div>
      </div>
    );
  }

  return (
    <div className="comment" data-level={comment.level}>
      <div className={collapsed ? 'meta meta-collapse' : 'meta'}>
        <button
          type="button"
          className="collapse"
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expand comment' : 'Collapse comment'}
          onClick={() => setCollapsed((c) => !c)}
        >
          [{collapsed ? '+' : '-'}]
        </button>{' '}
        {comment.user && <Link to={`/user/${comment.user}`}>{comment.user}</Link>}
        <span className="time">{comment.time_ago}</span>
      </div>
      <div className="comment-tree">
        <div hidden={collapsed}>
          <HtmlContent as="div" className="comment-text" html={comment.content} />
          {comment.comments.length > 0 && (
            <ul className="subtree">
              {comment.comments.map((child) => (
                <li key={child.id}>
                  <CommentTree comment={child} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
