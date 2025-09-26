import React from 'react'

interface ErrorMessageProps {
  message: string
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="error-section">
      <div className="skull">
        <div className="head">
          <div className="crack"></div>
        </div>
      </div>
      <p className="error-message">{message}</p>
    </div>
  )
}

export default ErrorMessage
