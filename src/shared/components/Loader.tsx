import styles from '../../styles/Loader.module.css';

export default function Loader() {
  return (
    <div className={styles['loading-section']}>
      <div className={styles.loader}>Loading...</div>
    </div>
  );
}
