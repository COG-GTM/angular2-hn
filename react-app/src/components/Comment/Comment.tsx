import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Comment as CommentType } from '../../types';
import './Comment.scss';

export function Comment({ comment }: { comment: CommentType }) {
    const [collapse, setCollapse] = useState(false);
    const toggleCollapse = () => setCollapse((current) => !current);
    const handleCollapseKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleCollapse();
        }
    };
    if (comment.deleted)
        return (
            <div className="deleted-meta">
                <span className="collapse">[deleted]</span> | Comment Deleted
            </div>
        );
    return (
        <div className="comment-root">
            <div className={`meta${collapse ? ' meta-collapse' : ''}`}>
                <span
                    className="collapse"
                    role="button"
                    tabIndex={0}
                    onClick={toggleCollapse}
                    onKeyDown={handleCollapseKeyDown}
                >
                    [{collapse ? '+' : '-'}]
                </span>{' '}
                <Link to={`/user/${comment.user}`}>{comment.user}</Link>
                <span className="time">{comment.time_ago}</span>
            </div>
            <div className="comment-tree">
                <div hidden={collapse}>
                    <p className="comment-text" dangerouslySetInnerHTML={{ __html: comment.content }} />
                    <ul className="subtree">
                        {comment.comments?.map((subComment) => (
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
