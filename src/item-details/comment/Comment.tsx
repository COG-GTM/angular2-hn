import { useState, type KeyboardEvent } from 'react';
import { NavLink } from 'react-router-dom';

import { Comment } from '../../shared/models';

import './Comment.scss';

interface CommentProps {
    comment: Comment;
}

export default function CommentItem({ comment }: CommentProps) {
    const [collapse, setCollapse] = useState(false);

    const toggleCollapse = () => setCollapse((collapsed) => !collapsed);

    const handleCollapseKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleCollapse();
        }
    };

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
            <div className={collapse ? 'meta meta-collapse' : 'meta'}>
                <span
                    className="collapse"
                    role="button"
                    tabIndex={0}
                    onClick={toggleCollapse}
                    onKeyDown={handleCollapseKeyDown}
                >
                    [{collapse ? '+' : '-'}]
                </span>{' '}
                <NavLink className={({ isActive }) => (isActive ? 'active' : undefined)} to={`/user/${comment.user}`}>
                    {comment.user}
                </NavLink>
                <span className="time">{comment.time_ago}</span>
            </div>
            <div className="comment-tree">
                <div hidden={collapse}>
                    <p className="comment-text" dangerouslySetInnerHTML={{ __html: comment.content ?? '' }}></p>
                    <ul className="subtree">
                        {comment.comments?.map((subComment) => (
                            <li key={subComment.id}>
                                <CommentItem comment={subComment} />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
