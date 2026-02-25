import './ErrorMessage.css';

interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="error-section">
      <p>{message}</p>
    </div>
  );
}
