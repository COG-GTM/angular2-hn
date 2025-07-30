import React, { useState } from 'react';
import { Comment } from './types';
import styles from './CommentComponent.module.css';

interface CommentComponentProps {
  comment: Comment;
}

const CommentComponent: React.FC<CommentComponentProps> = ({ comment }) => {
  const [collapse, setCollapse] = useState(false);

  const toggleCollapse = () => {
    setCollapse(!collapse);
  };

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
    <div>
      <div className={`${styles.meta} ${collapse ? styles.metaCollapse : ''}`}>
        <span className={styles.collapse} onClick={toggleCollapse}>
          [{collapse ? '+' : '-'}]
        </span>{' '}
        <a href={`/user/${comment.user}`}>{comment.user}</a>
        <span className={styles.time}>{comment.time_ago}</span>
      </div>
      <div className={styles.commentTree}>
        {!collapse && (
          <div>
            <p 
              className={styles.commentText}
              dangerouslySetInnerHTML={{ __html: comment.content }}
            />
            <ul className={styles.subtree}>
              {comment.comments.map((subComment) => (
                <li key={subComment.id}>
                  <CommentComponent comment={subComment} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentComponent;
