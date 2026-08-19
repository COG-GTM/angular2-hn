import '../../app/core/footer/footer.component.scss';
import { content } from '../scope';

const c = content('footer');

export function Footer() {
    return (
        <div id="footer" {...c}>
            <p {...c}>
                Show this project some ❤ on{' '}
                <a href="https://github.com/hdjirdeh/angular2-hn" target="_blank" rel="noopener" {...c}>
                    GitHub
                </a>
            </p>
        </div>
    );
}
