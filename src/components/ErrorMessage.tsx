interface ErrorMessageProps {
    message?: string;
}

// STUB (Task 0): full markup/styles land in the shared-components task.
export default function ErrorMessage({ message }: ErrorMessageProps) {
    return <div className="error-section">{message}</div>;
}
