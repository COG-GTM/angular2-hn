import React from 'react';
import styles from './ErrorMessage.module.css';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className={styles.errorSection}>
      <div className={styles.skull}>
        <div className={styles.head}>
          <div className={styles.crack}></div>
        </div>
        <div className={styles.mouth}>
          <div className={styles.teeth}></div>
        </div>
      </div>
      <p className={styles.strong}>{message}</p>
      <p>If you are offline viewing, you&#39;ll need to visit this page with a network connection first before it can work offline.</p>
    </div>
  );
};
