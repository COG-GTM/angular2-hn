import './ErrorMessage.scss';

interface ErrorMessageProps {
    /** Mirrors the Angular `@Input() message` (no default — callers always supply the text). */
    message: string;
}

/** Port of `app-error-message` (`ErrorMessageComponent`): CSS skull plus the error text. */
export function ErrorMessage({ message }: ErrorMessageProps) {
    return (
        <div className="app-error-message">
            <div className="error-section" role="alert">
                <div className="skull" aria-hidden="true">
                    <div className="head">
                        <div className="crack"></div>
                    </div>
                    <div className="mouth">
                        <div className="teeth"></div>
                    </div>
                </div>
                <p className="strong">{message}</p>
                <p>
                    If you are offline viewing, you'll need to visit this page with a network connection first
                    before it can work offline.
                </p>
            </div>
        </div>
    );
}
