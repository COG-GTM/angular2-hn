import { useState } from 'react';
import { Link } from 'react-router-dom';

import type { Comment as CommentModel } from '../../models/comment';
import { sanitizeHtml } from '../../utils/html';

import styles from './Comment.module.scss';

export interface CommentProps {
    comment: CommentModel;
}

export default function Comment({ comment }: CommentProps) {
    const [collapse, setCollapse] = useState(false);

    if (comment.deleted) {
        return (
            <div>
                <div className="deleted-meta">
                    <span className={styles.collapse}>[deleted]</span> | Comment Deleted
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className={collapse ? 'meta meta-collapse' : 'meta'}>
                <span className={styles.collapse} onClick={() => setCollapse((current) => !current)}>
                    [{collapse ? '+' : '-'}]
                </span>{' '}
                <Link to={`/user/${comment.user}`}>{comment.user}</Link>
                <span className={styles.time}>{comment.time_ago}</span>
            </div>
            <div className={styles.commentTree}>
                <div hidden={collapse}>
                    <p className={styles.commentText} dangerouslySetInnerHTML={{ __html: sanitizeHtml(comment.content) }} />
                    <ul className={styles.subtree}>
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
