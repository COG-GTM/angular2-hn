import styles from '../../styles/ErrorMessage.module.css';

interface ErrorMessageProps {
  errorMessage: string;
}

export default function ErrorMessage({ errorMessage }: ErrorMessageProps) {
  return (
    <div className={styles['error-section']}>
      <div className={styles.skull}>
        <div className={styles.head}>
          <div className={styles.crack}></div>
        </div>
        <div className={styles.mouth}>
          <div className={styles.teeth}></div>
        </div>
      </div>
      <p className={styles.strong}>{errorMessage}</p>
      <p>
        If you are offline viewing, you'll need to visit this page with a
        network connection first before it can work offline.
      </p>
    </div>
  );
}
