import { KeyboardEvent, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Comment as CommentModel } from '../models/comment';
import './Comment.scss';

interface CommentProps {
    comment: CommentModel;
}

export default function Comment({ comment }: CommentProps) {
    const [collapse, setCollapse] = useState(false);

    function toggleCollapse() {
        setCollapse(previous => !previous);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLSpanElement>) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleCollapse();
        }
    }

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
                    onKeyDown={handleKeyDown}
                >
                    [{collapse ? '+' : '-'}]
                </span>{' '}
                <NavLink
                    to={`/user/${comment.user}`}
                    className={({ isActive }) => (isActive ? 'active' : '')}
                >
                    {comment.user}
                </NavLink>
                <span className="time">{comment.time_ago}</span>
            </div>
            <div className="comment-tree">
                <div hidden={collapse}>
                    <p
                        className="comment-text"
                        dangerouslySetInnerHTML={{ __html: comment.content }}
                    ></p>
                    <ul className="subtree">
                        {comment.comments?.map(subComment => (
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
