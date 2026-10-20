import { useState } from 'react';
import { Link } from 'react-router-dom';

import type { Comment as CommentModel } from '../shared/models';
import './Comment.scss';

interface CommentProps {
    comment: CommentModel;
}

/**
 * Port of the recursive `CommentComponent` (`<app-comment>`): meta line with a
 * collapse toggle, the HTML comment body and the nested sub-tree rendered via itself.
 */
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

    return (
        <div className="app-comment">
            <div className={collapse ? 'meta meta-collapse' : 'meta'}>
                <span className="collapse" onClick={() => setCollapse((value) => !value)}>
                    [{collapse ? '+' : '-'}]
                </span>
                <Link to={`/user/${comment.user}`}>{comment.user}</Link>
                <span className="time">{comment.time_ago}</span>
            </div>
            <div className="comment-tree">
                <div hidden={collapse}>
                    <p className="comment-text" dangerouslySetInnerHTML={{ __html: comment.content }}></p>
                    <ul className="subtree">
                        {comment.comments.map((subComment) => (
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
