import { useState } from 'react';
import { Link } from 'react-router-dom';

import type { Comment as CommentModel } from '../models';
import './Comment.scss';

interface CommentProps {
    comment: CommentModel;
}

export function Comment({ comment }: CommentProps) {
    const [collapse, setCollapse] = useState(false);

    if (comment.deleted) {
        return (
            <div className="comment-view">
                <div className="deleted-meta">
                    <span className="collapse">[deleted]</span> | Comment Deleted
                </div>
            </div>
        );
    }

    return (
        <div className="comment-view">
            <div className={`meta${collapse ? ' meta-collapse' : ''}`}>
                <span className="collapse" onClick={() => setCollapse(!collapse)}>
                    [{collapse ? '+' : '-'}]
                </span>{' '}
                <Link to={`/user/${comment.user}`}>{comment.user}</Link>
                <span className="time">{comment.time_ago}</span>
            </div>
            <div className="comment-tree">
                <div hidden={collapse}>
                    <p
                        className="comment-text"
                        dangerouslySetInnerHTML={{ __html: comment.content }}
                    ></p>
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
