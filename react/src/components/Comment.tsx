import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Comment as CommentModel } from '../types/models';

export function Comment({ comment }: { comment: CommentModel }) {
  const [collapse, setCollapse] = useState(false);
  if (comment.deleted) {
    return <div className="deleted-meta"><span className="collapse">[deleted]</span> | Comment Deleted</div>;
  }
  return (
    <div>
      <div className={`meta${collapse ? ' meta-collapse' : ''}`}>
        <button className="collapse" onClick={() => setCollapse((current) => !current)}>[{collapse ? '+' : '-'}]</button>{' '}
        <Link to={`/user/${comment.user}`}>{comment.user}</Link><span className="time">{comment.time_ago}</span>
      </div>
      <div className="comment-tree"><div hidden={collapse}>
        <p className="comment-text" dangerouslySetInnerHTML={{ __html: comment.content }} />
        <ul className="subtree">{comment.comments.map((child) => <li key={child.id}><Comment comment={child} /></li>)}</ul>
      </div></div>
    </div>
  );
}
