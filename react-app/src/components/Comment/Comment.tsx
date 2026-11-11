import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Comment as CommentModel } from '../../models';
import { sanitizedHtml } from '../../utils/sanitize';
import './Comment.scss';

export function Comment({ comment }: { comment: CommentModel }) {
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
        <div className="comment">
            <div className={collapsed ? 'meta meta-collapse' : 'meta'}>
                <span
                    className="collapse"
                    role="button"
                    aria-expanded={!collapsed}
                    onClick={() => setCollapsed((c) => !c)}
                >
                    [{collapsed ? '+' : '-'}]
                </span>{' '}
                <Link to={`/user/${comment.user}`}>{comment.user}</Link>
                <span className="time">{comment.time_ago}</span>
            </div>
            <div className="comment-tree">
                <div hidden={collapsed}>
                    <p className="comment-text" dangerouslySetInnerHTML={sanitizedHtml(comment.content)} />
                    <ul className="subtree">
                        {comment.comments.map((sub) => (
                            <li key={sub.id}>
                                <Comment comment={sub} />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
