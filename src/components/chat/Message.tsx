import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';
import { Message as MessageType } from '../../types/message';

interface MessageProps {
  message: MessageType;
}

const CodeBlock: Components['code'] = ({ children, className, node, ...rest }) => {
  const match = /language-(\w+)/.exec(className || '');
  const codeString = String(children).replace(/\n$/, '');
  const isMultiline = codeString.includes('\n');

  return isMultiline && match ? (
    <SyntaxHighlighter
      style={oneDark as any}
      language={match[1]}
      PreTag="div"
    >
      {codeString}
    </SyntaxHighlighter>
  ) : (
    <code className={className} {...rest}>
      {children}
    </code>
  );
};

const Message: React.FC<MessageProps> = React.memo(({ message }) => {
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
    <div className={`message ${variant}`}>
      <div className="message-bubble">
        <div className="message-header">
          <span className="sender">{senderLabel}</span>
          {variant === 'assistant' && (
            <button
              className="copy-btn"
              onClick={handleCopy}
              aria-label="Скопировать сообщение"
              title="Скопировать"
              type="button"
            >
              {copied ? '✅ Скопировано' : '📋'}
            </button>
          )}
        </div>
        <div className="message-content">
          {message.imageUrl && (
            <img
              src={message.imageUrl}
              alt={message.imageAlt || 'Прикреплённое изображение'}
              className="message-image"
            />
          )}
          <ReactMarkdown components={{ code: CodeBlock }}>
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
});

Message.displayName = 'Message';

export default Message;