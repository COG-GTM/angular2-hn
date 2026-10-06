// Ported from src/app/item-details/comment/comment.component.{ts,html}
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Comment } from '../../types';
import { buttonProps } from './a11y';
import { sanitizeHtml } from './sanitizeHtml';
import './CommentTree.scss';

export function CommentTree({ comment }: { comment: Comment }) {
  const [collapse, setCollapse] = useState(false);
  const content = useMemo(() => sanitizeHtml(comment.content), [comment.content]);

  if (comment.deleted) {
    return (
      <div className="comment-node">
        <div className="deleted-meta">
          <span className="collapse">[deleted]</span> | Comment Deleted
        </div>
      </div>
    );
  }

  return (
    <div className="comment-node">
      <div className={collapse ? 'meta meta-collapse' : 'meta'}>
        <span className="collapse" aria-expanded={!collapse} {...buttonProps(() => setCollapse((c) => !c))}>
          [{collapse ? '+' : '-'}]
        </span>
        <Link to={`/user/${comment.user}`}>{comment.user}</Link>
        <span className="time">{comment.time_ago}</span>
      </div>
      <div className="comment-tree">
        <div hidden={collapse}>
          <p className="comment-text" dangerouslySetInnerHTML={{ __html: content }} />
          <ul className="subtree">
            {comment.comments?.map((sub) => (
              <li key={sub.id}>
                <CommentTree comment={sub} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
