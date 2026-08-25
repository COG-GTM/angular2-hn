import { useState } from 'react';
import { Link } from 'react-router-dom';

import type { Comment as CommentModel } from '../../shared/models';
import { sanitizeHtml } from '../../shared/utils/sanitizeHtml';
import './Comment.scss';

interface CommentProps {
    comment: CommentModel;
}

function Comment({ comment }: CommentProps) {
    const [collapse, setCollapse] = useState(false);

    return (
        <>
            {!comment.deleted && (
                <div>
                    <div className={`meta${collapse ? ' meta-collapse' : ''}`}>
                        <span className="collapse" onClick={() => setCollapse((current) => !current)}>
                            [{collapse ? '+' : '-'}]
                        </span>{' '}
                        <Link to={`/user/${comment.user}`}>{comment.user}</Link>
                        <span className="time">{comment.time_ago}</span>
                    </div>
                    <div className="comment-tree">
                        <div hidden={collapse}>
                            <p
                                className="comment-text"
                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(comment.content) }}
                            />
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
            )}
            {comment.deleted && (
                <div className="deleted-meta">
                    <span className="collapse">[deleted]</span> | Comment Deleted
                </div>
            )}
        </>
    );
}

export default Comment;
