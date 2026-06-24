import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Comment as CommentModel } from '../models/Comment';
import '../app/item-details/comment/comment.component.scss';

interface CommentProps {
    comment: CommentModel;
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
            <div className="comment-meta">
                <span className="collapse" onClick={() => setCollapsed(!collapsed)}>
                    {collapsed ? '[+]' : '[-]'}
                </span>
                {' '}
                <Link to={`/user/${comment.user}`} className="author">
                    {comment.user}
                </Link>{' '}
                {comment.time_ago}
            </div>
            {!collapsed && (
                <div className="comment-text">
                    <p dangerouslySetInnerHTML={{ __html: comment.content }} />
                    {comment.comments && comment.comments.length > 0 && (
                        <div className="nested-comments">
                            {comment.comments.map((child) => (
                                <Comment key={child.id} comment={child} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
