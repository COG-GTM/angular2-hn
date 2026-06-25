import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Comment } from '../../shared/models/types';
import './comment.component.scss';

interface CommentProps {
    comment: Comment;
}

export function CommentComponent({ comment }: CommentProps) {
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
                        <p className="comment-text" dangerouslySetInnerHTML={{ __html: comment.content }} />
                        <ul className="subtree">
                            {comment.comments?.map((subComment) => (
                                <li key={subComment.id}>
                                    <CommentComponent comment={subComment} />
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
