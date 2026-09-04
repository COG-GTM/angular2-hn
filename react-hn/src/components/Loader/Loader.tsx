import React from 'react';

import styles from './Loader.module.scss';

const Loader: React.FC = () => (
  <div className={`loading-section ${styles.loadingSection}`}>
    <div className={`loader ${styles.loader}`}>Loading...</div>
  </div>
);

export default Loader;
