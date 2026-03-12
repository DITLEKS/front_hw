import React from 'react';

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="error-message">
      <span role="img" aria-label="error">
        ⚠️
      </span>{' '}
      {message}
    </div>
  );
};

export default ErrorMessage;