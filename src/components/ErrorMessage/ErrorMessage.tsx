import './ErrorMessage.scss';

interface ErrorMessageProps {
    message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
    return (
        <div className="error-section">
            <div className="skull">
                <div className="head">
                    <div className="crack"></div>
                </div>
                <div className="mouth"></div>
                <div className="teeth"></div>
            </div>
            <p className="error-text">{message}</p>
        </div>
    );
}
