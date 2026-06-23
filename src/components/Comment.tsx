import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Comment as CommentType } from '../types/comment';
import './Comment.scss';

interface CommentProps {
    comment: CommentType;
}

export function Comment({ comment }: CommentProps) {
    const [collapsed, setCollapsed] = useState(false);

    if (comment.deleted) {
        return (
            <div className="deleted-meta">
                <span className="collapse-toggle">[deleted]</span> | Comment Deleted
            </div>
        );
    }

    return (
        <div>
            <div className={`meta${collapsed ? ' meta-collapse' : ''}`}>
                <span className="collapse-toggle" onClick={() => setCollapsed(!collapsed)}>
                    [{collapsed ? '+' : '-'}]
                </span>{' '}
                <Link to={`/user/${comment.user}`}>{comment.user}</Link>
                <span className="time">{comment.time_ago}</span>
            </div>
            <div className="comment-tree">
                {!collapsed && (
                    <div>
                        <p className="comment-text" dangerouslySetInnerHTML={{ __html: comment.content }} />
                        <ul className="subtree">
                            {comment.comments &&
                                comment.comments.map((subComment) => (
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
