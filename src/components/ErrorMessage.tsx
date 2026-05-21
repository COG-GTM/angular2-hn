import styles from './ErrorMessage.module.scss';

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className={styles.errorSection}>
      <p>{message}</p>
    </div>
  );
}
