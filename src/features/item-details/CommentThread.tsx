import { useState } from 'react';
import { Link } from 'react-router-dom';

import type { Comment } from '../../shared/models/comment';
import './CommentThread.scss';

interface CommentThreadProps {
    comment: Comment;
}

export default function CommentThread({ comment }: CommentThreadProps) {
    const [collapsed, setCollapsed] = useState(false);

    if (comment.deleted) {
        return (
            <div className="comment-thread">
                <div className="deleted-meta">
                    <span className="collapse">[deleted]</span> | Comment Deleted
                </div>
            </div>
        );
    }

    return (
        <div className="comment-thread">
            <div className={collapsed ? 'meta meta-collapse' : 'meta'}>
                <span
                    className="collapse"
                    role="button"
                    aria-expanded={!collapsed}
                    aria-label={collapsed ? 'Expand comment' : 'Collapse comment'}
                    onClick={() => setCollapsed(!collapsed)}
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
                        {comment.comments?.map((subComment) => (
                            <li key={subComment.id}>
                                <CommentThread comment={subComment} />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
