import './Footer.scss';

/** Port of `core/footer` (hidden on mobile). */
export function Footer() {
    return (
        <div id="footer" data-testid="footer">
            <p>
                Show this project some ❤ on{' '}
                <a href="https://github.com/hdjirdeh/angular2-hn" target="_blank" rel="noopener noreferrer">
                    GitHub
                </a>
            </p>
        </div>
    );
}
