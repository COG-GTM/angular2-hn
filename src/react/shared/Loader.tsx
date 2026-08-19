import '../../app/shared/components/loader/loader.component.scss';
import { content } from '../scope';

const c = content('loader');

export function Loader() {
    return (
        <div className="loading-section" {...c}>
            <div className="loader" {...c}>
                Loading...
            </div>
        </div>
    );
}
