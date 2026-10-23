import { useState, type KeyboardEvent } from 'react';
import { NavLink } from 'react-router-dom';

import type { Comment as CommentModel } from '../../types';
import { sanitizeHtml } from '../../utils';
import './Comment.scss';

export interface CommentProps {
    comment: CommentModel;
}

/** Port of src/app/item-details/comment (recursive). */
export function Comment({ comment }: CommentProps) {
    const [collapse, setCollapse] = useState(false);

    if (comment.deleted) {
        return (
            <div className="app-comment">
                <div className="deleted-meta">
                    <span className="collapse">[deleted]</span> | Comment Deleted
                </div>
            </div>
        );
    }

    const toggle = () => setCollapse((value) => !value);
    const onKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggle();
        }
    };

    return (
        <div className="app-comment">
            <div className={collapse ? 'meta meta-collapse' : 'meta'}>
                <span
                    className="collapse"
                    role="button"
                    tabIndex={0}
                    aria-expanded={!collapse}
                    aria-label={`${collapse ? 'Expand' : 'Collapse'} comment by ${comment.user}`}
                    onClick={toggle}
                    onKeyDown={onKeyDown}
                >
                    [{collapse ? '+' : '-'}]
                </span>
                <NavLink to={`/user/${comment.user}`}>{comment.user}</NavLink>
                <span className="time">{comment.time_ago}</span>
            </div>
            <div className="comment-tree">
                <div hidden={collapse}>
                    <p className="comment-text" dangerouslySetInnerHTML={{ __html: sanitizeHtml(comment.content) }} />
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
