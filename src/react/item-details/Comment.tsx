import { useState } from 'react';
import { Link } from 'react-router-dom';

import '../../app/item-details/comment/comment.component.scss';
import { Comment as CommentModel } from '../models/comment';
import { content, host } from '../scope';
import { sanitizeHtml } from '../shared/sanitize';

const c = content('comment');

export function Comment({ comment }: { comment: CommentModel }) {
    const [collapse, setCollapse] = useState(false);

    if (comment.deleted) {
        return (
            <div {...c}>
                <div className="deleted-meta" {...c}>
                    <span className="collapse" {...c}>
                        [deleted]
                    </span>{' '}
                    | Comment Deleted
                </div>
            </div>
        );
    }

    return (
        <div {...c}>
            <div className={collapse ? 'meta meta-collapse' : 'meta'} {...c}>
                <span className="collapse" onClick={() => setCollapse(!collapse)} {...c}>
                    [{collapse ? '+' : '-'}]
                </span>
                <Link to={`/user/${comment.user}`} {...c}>
                    {comment.user}
                </Link>
                <span className="time" {...c}>
                    {comment.time_ago}
                </span>
            </div>
            <div className="comment-tree" {...c}>
                <div hidden={collapse} {...c}>
                    <p className="comment-text" dangerouslySetInnerHTML={{ __html: sanitizeHtml(comment.content) }} {...c}></p>
                    <ul className="subtree" {...c}>
                        {(comment.comments ?? []).map(subComment => (
                            <li key={subComment.id} {...c}>
                                <app-comment {...c} {...host('comment')}>
                                    <Comment comment={subComment} />
                                </app-comment>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
