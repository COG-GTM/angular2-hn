import { useState, type KeyboardEvent } from 'react';
import { NavLink } from 'react-router-dom';

import type { Comment as CommentModel } from '../../shared/models';
import { sanitizeHtml } from '../../shared/utils';
import './Comment.scss';

export interface CommentProps {
    comment: CommentModel;
}

/** Port of `CommentComponent`: one comment with its collapsible, recursive subtree. */
export function Comment({ comment }: CommentProps) {
    const [collapse, setCollapse] = useState(false);

    if (comment.deleted) {
        return (
            <div className="comment">
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
        <div className="comment">
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
                <NavLink to={`/user/${encodeURIComponent(comment.user ?? '')}`}>{comment.user}</NavLink>
                <span className="time">{comment.time_ago}</span>
            </div>
            <div className="comment-tree">
                <div hidden={collapse}>
                    <p className="comment-text" dangerouslySetInnerHTML={{ __html: sanitizeHtml(comment.content) }}></p>
                    <ul className="subtree">
                        {(comment.comments ?? []).map((subComment, index) => (
                            <li key={subComment.id ?? `i${index}`}>
                                <Comment comment={subComment} />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
