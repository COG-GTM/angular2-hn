import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CommentProps } from './Comment.types';
import styles from './Comment.module.scss';

const Comment: React.FC<CommentProps> = ({ comment }) => {
  const [collapse, setCollapse] = useState(false);

  if (comment.deleted) {
    return (
      <div>
        <div className={styles['deleted-meta']}>
          <span className={styles.collapse}>[deleted]</span> | Comment Deleted
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={collapse ? `${styles.meta} ${styles['meta-collapse']}` : styles.meta}>
        <span className={styles.collapse} onClick={() => setCollapse(!collapse)}>
          [{collapse ? '+' : '-'}]
        </span>{' '}
        <Link to={`/user/${comment.user}`}>{comment.user}</Link>
        <span className={styles.time}>{comment.time_ago}</span>
      </div>
      <div className={styles['comment-tree']}>
        {!collapse && (
          <div>
            <p
              className={styles['comment-text']}
              dangerouslySetInnerHTML={{ __html: comment.content }}
            />
            <ul className={styles.subtree}>
              {comment.comments.map((subComment) => (
                <li key={subComment.id}>
                  <Comment comment={subComment} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Comment;
