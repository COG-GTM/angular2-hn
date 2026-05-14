import React from 'react';
import styles from './Loader.module.css';

export const Loader: React.FC = () => {
  return (
    <div className={styles.loadingSection}>
      <div className={styles.loader}>
        Loading...
      </div>
    </div>
  );
};
