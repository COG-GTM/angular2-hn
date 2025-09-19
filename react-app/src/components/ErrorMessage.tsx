
interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="error-message">
      <p>Error: {message}</p>
    </div>
  );
}
