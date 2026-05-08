import './ErrorMessage.scss';

interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="error-section">
      <div className="skull">
        <div className="head">
          <div className="crack" />
        </div>
        <div className="mouth" />
        <div className="teeth" />
      </div>
      <p className="error-message">{message}</p>
    </div>
  );
}
