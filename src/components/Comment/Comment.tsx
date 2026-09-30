import { useState } from 'react';
import type { Comment as CommentModel } from '../../models';
import { classNames } from '../../utils/classNames';
import { sanitizeHtml } from '../../utils/sanitize';
import { RouterLink } from '../RouterLink';
import './Comment.scss';

export function Comment({ comment }: { comment: CommentModel }) {
    const [collapse, setCollapse] = useState(false);

    return (
        <app-comment>
            {!comment.deleted ? (
                <div>
                    <div className={classNames('meta', collapse && 'meta-collapse')}>
                        <span className="collapse" onClick={() => setCollapse(!collapse)}>
                            {`[${collapse ? '+' : '-'}]`}
                        </span>
                        <RouterLink to={`/user/${comment.user}`}>{comment.user}</RouterLink>
                        <span className="time">{comment.time_ago}</span>
                    </div>
                    <div className="comment-tree">
                        <div hidden={collapse}>
                            <p className="comment-text" dangerouslySetInnerHTML={{ __html: sanitizeHtml(comment.content) }} />
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
            ) : (
                <div>
                    <div className="deleted-meta">
                        <span className="collapse">[deleted]</span>
                        {' | Comment Deleted '}
                    </div>
                </div>
            )}
        </app-comment>
    );
}
