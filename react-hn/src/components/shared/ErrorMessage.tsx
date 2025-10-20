interface ErrorMessageProps {
  message: string;
}

const ErrorMessage = ({ message }: ErrorMessageProps) => {
  return (
    <div className="error-message">
      <p>Error: {message}</p>
    </div>
  );
};

export default ErrorMessage;
