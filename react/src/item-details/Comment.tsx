import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import type { Comment as CommentModel } from '../shared/models';
import { SafeHtml } from '../shared/components/SafeHtml/SafeHtml';
import { onActivateKey } from '../shared/utils/a11y';
import './Comment.scss';

export interface CommentProps {
    comment: CommentModel;
}

export function Comment({ comment }: CommentProps) {
    const [collapse, setCollapse] = useState(false);
    const toggle = () => setCollapse((value) => !value);

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
                    aria-expanded={!collapse}
                    aria-label={`${collapse ? 'Expand' : 'Collapse'} comment by ${comment.user}`}
                    onClick={toggle}
                    onKeyDown={onActivateKey(toggle)}
                >
                    [{collapse ? '+' : '-'}]
                </span>{' '}
                <NavLink to={`/user/${comment.user}`}>{comment.user}</NavLink>
                <span className="time">{comment.time_ago}</span>
            </div>
            <div className="comment-tree">
                <div hidden={collapse}>
                    <SafeHtml as="p" className="comment-text" html={comment.content} />
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
