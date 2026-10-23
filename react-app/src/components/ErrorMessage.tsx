import './ErrorMessage.scss';

export interface ErrorMessageProps {
    message: string;
}

/** Port of src/app/shared/components/error-message. */
export function ErrorMessage({ message }: ErrorMessageProps) {
    return (
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
                If you are offline viewing, you&apos;ll need to visit this page with a network connection first before
                it can work offline.
            </p>
        </div>
    );
}
