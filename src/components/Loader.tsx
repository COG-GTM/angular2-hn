import styles from './Loader.module.scss';

export function Loader() {
  return (
    <div className={styles.loaderContainer}>
      <div className="loader" />
    </div>
  );
}
