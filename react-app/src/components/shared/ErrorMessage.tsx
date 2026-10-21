export interface ErrorMessageProps {
  message: string;
}

/** Placeholder: ported by the "chrome" session (src/app/shared/components/error-message). */
export default function ErrorMessage({ message }: ErrorMessageProps) {
  return <div className="error-section">{message}</div>;
}
