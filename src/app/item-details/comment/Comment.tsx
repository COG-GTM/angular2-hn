import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Comment as CommentModel } from '../../shared/models/comment';
import styles from './Comment.module.scss';

interface CommentProps {
  comment: CommentModel;
}

export function Comment({ comment }: CommentProps) {
  const [collapse, setCollapse] = useState(false);

  if (comment.deleted) {
    return (
      <div>
        <div className={styles.deletedMeta}>
          <span className={styles.collapse}>[deleted]</span> | Comment Deleted
        </div>
      </div>
    );
  }

  return (
    <div className={styles.commentWrapper}>
      <div className={`${styles.meta}${collapse ? ` ${styles.metaCollapse}` : ''}`}>
        <span className={styles.collapse} onClick={() => setCollapse(!collapse)}>
          [{collapse ? '+' : '-'}]
        </span>{' '}
        <Link to={`/user/${comment.user}`}>{comment.user}</Link>
        <span className={styles.time}>{comment.time_ago}</span>
      </div>
      <div className={styles.commentTree}>
        <div hidden={collapse}>
          <p
            className={styles.commentText}
            dangerouslySetInnerHTML={{ __html: comment.content }}
          />
          <ul className={styles.subtree}>
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
