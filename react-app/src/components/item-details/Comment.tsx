import { useState } from 'react';
import { Link } from 'react-router-dom';

import type { Comment as CommentModel } from '../../types';
import styles from './Comment.module.scss';

export function Comment({ comment }: { comment: CommentModel }) {
    const [collapsed, setCollapsed] = useState(false);

    if (comment.deleted) {
        return (
            <div className={styles.comment}>
                <div className="deleted-meta">
                    <span className={styles.collapse}>[deleted]</span> | Comment Deleted
                </div>
            </div>
        );
    }

    return (
        <div className={styles.comment}>
            <div className={`meta ${collapsed ? styles.metaCollapse : ''}`}>
                <span className={styles.collapse} role="button" tabIndex={0} onClick={() => setCollapsed(!collapsed)}>
                    [{collapsed ? '+' : '-'}]
                </span>{' '}
                <Link to={`/user/${comment.user}`}>{comment.user}</Link>
                <span className={styles.time}>{comment.time_ago}</span>
            </div>
            <div className={styles.commentTree}>
                <div hidden={collapsed}>
                    <p className={styles.commentText} dangerouslySetInnerHTML={{ __html: comment.content }}></p>
                    <ul className={styles.subtree}>
                        {comment.comments?.map(subComment => (
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
