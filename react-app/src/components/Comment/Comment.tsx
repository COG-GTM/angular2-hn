import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Comment as CommentType } from '../../types';
import './Comment.scss';

interface CommentProps {
    comment: CommentType;
}

export default function Comment({ comment }: CommentProps) {
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
                <span className="collapse" onClick={() => setCollapsed(!collapsed)}>
                    [{collapsed ? '+' : '-'}]
                </span>{' '}
                <Link to={`/user/${comment.user}`}>{comment.user}</Link>
                <span className="time">{comment.time_ago}</span>
            </div>
            <div className="comment-tree">
                {!collapsed && (
                    <div>
                        <p
                            className="comment-text"
                            dangerouslySetInnerHTML={{ __html: comment.content }}
                        />
                        <ul className="subtree">
                            {comment.comments &&
                                comment.comments.map((sub) => (
                                    <li key={sub.id}>
                                        <Comment comment={sub} />
                                    </li>
                                ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
