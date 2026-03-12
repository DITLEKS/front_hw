import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../../types/chat';

interface MessageProps {
  message: ChatMessage;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const [hover, setHover] = useState(false);

  const variant = message.role === 'user' ? 'user' : 'assistant';
  const senderLabel = message.role === 'user' ? 'Вы' : 'GigaChat';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };

  return (
    <div
      className={`message ${variant}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="message-bubble">
        <div className="message-header">
          <span className="sender">{senderLabel}</span>
          <button
            className={`copy-btn ${hover ? 'visible' : ''}`}
            onClick={handleCopy}
            aria-label="Copy message"
            title="Скопировать"
          >
            📋
          </button>
        </div>
        <div className="message-content">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default Message;