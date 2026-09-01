// PLACEHOLDER (Phase 1 scaffold) - replaced by the Phase 2D port.
export interface ErrorMessageProps {
    message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
    return (
        <div className="error-section">
            <p className="strong">{message}</p>
            <p>
                If you are offline viewing, you&apos;ll need to visit this page with a network connection first before
                it can work offline.
            </p>
        </div>
    );
}
