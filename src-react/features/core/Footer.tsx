import './Footer.scss';

/** Port of `footer.component`. */
export function Footer() {
    return (
        <div id="footer" data-testid="footer-placeholder">
            <p>
                Show this project some ❤ on{' '}
                <a href="https://github.com/hdjirdeh/angular2-hn" target="_blank" rel="noopener">
                    GitHub
                </a>
            </p>
        </div>
    );
}
