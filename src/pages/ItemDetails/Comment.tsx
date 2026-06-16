import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Comment } from '../../types/comment';
import styles from './Comment.module.scss';

interface CommentProps {
    comment: Comment;
}

export default function CommentComponent({ comment }: CommentProps) {
    const [collapse, setCollapse] = useState(false);

    if (comment.deleted) {
        return (
            <div className={`deleted-meta ${styles.deletedMeta}`}>
                <span className={styles.collapse}>[deleted]</span> | Comment Deleted
            </div>
        );
    }

    return (
        <div className={styles.comment}>
            <div className={`meta ${styles.meta} ${collapse ? styles.metaCollapse : ''}`}>
                <span className={styles.collapse} onClick={() => setCollapse(!collapse)}>
                    [{collapse ? '+' : '-'}]
                </span>{' '}
                <Link to={`/user/${comment.user}`}>{comment.user}</Link>
                <span className={styles.time}>{comment.time_ago}</span>
            </div>
            <div className={styles.commentTree}>
                {!collapse && (
                    <>
                        <p
                            className={styles.commentText}
                            dangerouslySetInnerHTML={{ __html: comment.content }}
                        />
                        <ul className={styles.subtree}>
                            {comment.comments &&
                                comment.comments.map((subComment) => (
                                    <li key={subComment.id}>
                                        <CommentComponent comment={subComment} />
                                    </li>
                                ))}
                        </ul>
                    </>
                )}
            </div>
        </div>
    );
}
