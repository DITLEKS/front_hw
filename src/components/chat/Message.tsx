import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Message as MessageType } from '../../types/message';

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const [hover, setHover] = useState(false);
  const [copied, setCopied] = useState(false);

  const variant = message.role === 'user' ? 'user' : 'assistant';
  const senderLabel = message.role === 'user' ? 'Вы' : 'GigaChat';

  const handleCopy = async () => {
    if (!navigator.clipboard) return;

    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed', error);
    }
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
          {variant === 'assistant' && (
            <button
              className={`copy-btn ${hover ? 'visible' : ''}`}
              onClick={handleCopy}
              aria-label="Copy message"
              title="Скопировать"
              type="button"
            >
              {copied ? '✅ Скопировано' : '📋'}
            </button>
          )}
        </div>
        <div className="message-content">
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={oneDark as any}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default Message;