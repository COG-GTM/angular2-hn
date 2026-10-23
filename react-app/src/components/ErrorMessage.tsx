export interface ErrorMessageProps {
    message: string;
}

/** PLACEHOLDER (Phase 5 replaces): port of src/app/shared/components/error-message. */
export function ErrorMessage({ message }: ErrorMessageProps) {
    return <div data-testid="error-message-placeholder">{message}</div>;
}
