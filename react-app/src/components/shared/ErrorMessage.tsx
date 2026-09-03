import styles from './ErrorMessage.module.scss';

export function ErrorMessage({ message }: { message: string }) {
    return (
        <div className={`error-section ${styles.errorSection}`}>
            <div className="skull">
                <div className="head">
                    <div className="crack"></div>
                </div>
                <div className="mouth">
                    <div className="teeth"></div>
                </div>
            </div>
            <p className={styles.strong}>{message}</p>
            <p>
                If you are offline viewing, you'll need to visit this page with a network connection first before it
                can work offline.
            </p>
        </div>
    );
}
