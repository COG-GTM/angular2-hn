import styles from './Loader.module.scss';

export function Loader() {
    return (
        <div className={styles['loading-section']}>
            <div className={`loader ${styles.loader}`}>Loading...</div>
        </div>
    );
}
