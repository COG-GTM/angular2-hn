import { useState } from 'react';
import { Link } from 'react-router';
import type { Comment as CommentModel } from '../../models';
import { sanitizeHtml } from './sanitizeHtml';
import './Comment.scss';

export function Comment({ comment }: { comment: CommentModel }) {
  const [collapsed, setCollapsed] = useState(false);
  return <div className="hn-comment">{comment.deleted
    ? <div className="deleted-meta"><span className="collapse">[deleted]</span> | Comment Deleted</div>
    : <>
      <div className={`meta${collapsed ? ' meta-collapse' : ''}`}>
        <span className="collapse" role="button" tabIndex={0} aria-label={`${collapsed ? 'Expand' : 'Collapse'} comment by ${comment.user}`} aria-expanded={!collapsed} onClick={() => setCollapsed(!collapsed)} onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setCollapsed(!collapsed); }
        }}>[{collapsed ? '+' : '-'}]</span>{' '}
        <Link to={`/user/${comment.user}`}>{comment.user}</Link>
        <span className="time">{comment.time_ago}</span>
      </div>
      <div className="comment-tree"><div hidden={collapsed}>
        <p className="comment-text" dangerouslySetInnerHTML={{ __html: sanitizeHtml(comment.content) }} />
        <ul className="subtree">{comment.comments.map(child => <li key={child.id}><Comment comment={child} /></li>)}</ul>
      </div></div>
    </>}</div>;
}
