import '../../app/shared/components/error-message/error-message.component.scss';
import { content } from '../scope';

const c = content('error-message');

export function ErrorMessage({ message }: { message: string }) {
    return (
        <div className="error-section" {...c}>
            <div className="skull" {...c}>
                <div className="head" {...c}>
                    <div className="crack" {...c}></div>
                </div>
                <div className="mouth" {...c}>
                    <div className="teeth" {...c}></div>
                </div>
            </div>
            <p className="strong" {...c}>
                {message}
            </p>
            <p {...c}>
                If you are offline viewing, you'll need to visit this page with a network connection first before it can
                work offline.
            </p>
        </div>
    );
}
