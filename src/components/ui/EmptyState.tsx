import React from 'react';

const EmptyState: React.FC<{ text?: string }> = ({ text = "No data" }) => {
  return (
    <div className="empty-state">
      <span role="img" aria-label="empty">
        📭
      </span>
      {text}
    </div>
  );
};

export default EmptyState;