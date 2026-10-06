import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Comment as CommentModel } from '../../models';
import './Comment.scss';

export interface CommentProps {
    comment: CommentModel;
}

export function Comment({ comment }: CommentProps) {
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
            <div className={`meta${collapsed ? ' meta-collapse' : ''}`}>
                <span
                    className="collapse"
                    role="button"
                    tabIndex={0}
                    aria-expanded={!collapsed}
                    aria-label={collapsed ? 'Expand comment' : 'Collapse comment'}
                    onClick={() => setCollapsed((c) => !c)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setCollapsed((c) => !c);
                        }
                    }}
                >
                    [{collapsed ? '+' : '-'}]
                </span>{' '}
                <Link to={`/user/${comment.user}`}>{comment.user}</Link>
                <span className="time">{comment.time_ago}</span>
            </div>
            <div className="comment-tree">
                <div hidden={collapsed}>
                    <p className="comment-text" dangerouslySetInnerHTML={{ __html: comment.content }}></p>
                    <ul className="subtree">
                        {(comment.comments ?? []).map((subComment) => (
                            <li key={subComment.id}>
                                <Comment comment={subComment} />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
