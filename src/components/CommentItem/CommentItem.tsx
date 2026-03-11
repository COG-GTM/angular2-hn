import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Comment } from '../../types/comment';
import styles from './CommentItem.module.scss';

interface CommentItemProps {
    comment: Comment;
}

export default function CommentItem({ comment }: CommentItemProps) {
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
            <div className={`meta ${collapse ? styles['meta-collapse'] : ''}`}>
                <span className={styles.collapse} onClick={() => setCollapse(!collapse)}>
                    [{collapse ? '+' : '-'}]
                </span>{' '}
                <Link to={`/user/${comment.user}`}>{comment.user}</Link>
                <span className={styles.time}>{comment.time_ago}</span>
            </div>
            <div className={styles['comment-tree']}>
                <div hidden={collapse}>
                    <p
                        className={styles['comment-text']}
                        dangerouslySetInnerHTML={{ __html: comment.content }}
                    />
                    <ul className={styles.subtree}>
                        {comment.comments &&
                            comment.comments.map((subComment) => (
                                <li key={subComment.id}>
                                    <CommentItem comment={subComment} />
                                </li>
                            ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
