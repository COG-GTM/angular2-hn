import DOMPurify from 'dompurify';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import type { Comment as CommentModel } from '../models/comment';

import './Comment.scss';

export default function Comment({ comment }: { comment: CommentModel }) {
    const [collapsed, setCollapsed] = useState(false);

    if (comment.deleted) {
        return (
            <div className="deleted-meta">
                <span className="collapse">[deleted]</span> | Comment Deleted
            </div>
        );
    }

    return (
        <div>
            <div className={collapsed ? 'meta meta-collapse' : 'meta'}>
                <span className="collapse" onClick={() => setCollapsed(!collapsed)}>
                    [{collapsed ? '+' : '-'}]
                </span>{' '}
                <Link to={`/user/${comment.user}`}>{comment.user}</Link>
                <span className="time">{comment.time_ago}</span>
            </div>
            <div className="comment-tree">
                <div hidden={collapsed}>
                    <p
                        className="comment-text"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comment.content ?? '') }}
                    />
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
