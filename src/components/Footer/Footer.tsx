import styles from './Footer.module.scss'

export function Footer() {
    return (
        <div className={styles.footer}>
            <p>
                Show this project some ❤ on{' '}
                <a href="https://github.com/hdjirdeh/angular2-hn" target="_blank" rel="noopener noreferrer">
                    GitHub
                </a>
            </p>
        </div>
    )
}
