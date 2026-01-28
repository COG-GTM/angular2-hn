import React from 'react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="error-section">
      <p className="strong">{message}</p>
      <p>
        If you are offline viewing, you'll need to visit this page with a network
        connection first before it can work offline.
      </p>
    </div>
  );
};

export default ErrorMessage;
