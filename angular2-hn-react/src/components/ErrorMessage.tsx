import React from 'react';
import '../styles/ErrorMessage.scss';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="error-section">
      <div className="skull">
        <div className="head">
          <div className="crack"></div>
        </div>
        <div className="mouth">
          <div className="teeth"></div>
        </div>
      </div>
      <p className="error-message">{message}</p>
    </div>
  );
};

export default ErrorMessage;
