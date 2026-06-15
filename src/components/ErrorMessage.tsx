import styles from './ErrorMessage.module.scss';

interface ErrorMessageProps {
    message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
    return (
        <div className={`error-section ${styles['error-section']}`}>
            <div className={`skull ${styles.skull}`}>
                <div className={`head ${styles.head}`}>
                    <div className={`crack ${styles.crack}`}></div>
                </div>
                <div className={`mouth ${styles.mouth}`}>
                    <div className={`teeth ${styles.teeth}`}></div>
                </div>
            </div>
            <p className="strong">{message}</p>
            <p>
                If you are offline viewing, you&apos;ll need to visit this page
                with a network connection first before it can work offline.
            </p>
        </div>
    );
}
