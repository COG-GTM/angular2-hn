import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Comment as CommentType } from '../../../types/story';
import './Comment.css';

interface CommentProps {
    comment: CommentType;
}

export const Comment: React.FC<CommentProps> = ({ comment }) => {
    const [collapsed, setCollapsed] = useState(false);

    if (comment.deleted) {
        return null;
    }

    return (
        <div className="comment" style={{ marginLeft: `${comment.level * 20}px` }}>
            <div className="comment-meta">
                <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
                    [{collapsed ? '+' : '-'}]
                </button>
                <Link to={`/user/${comment.user}`}>{comment.user}</Link>
                <span className="time-ago"> {comment.time_ago}</span>
            </div>
            {!collapsed && (
                <>
                    <div className="comment-text" dangerouslySetInnerHTML={{ __html: comment.content }} />
                    {comment.comments?.map((child) => (
                        <Comment key={child.id} comment={child} />
                    ))}
                </>
            )}
        </div>
    );
};
