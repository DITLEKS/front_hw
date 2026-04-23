import React from 'react';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import { Message as MessageType } from '../../types/message';

interface MessageListProps {
  messages: MessageType[];
  isLoading: boolean;
}

const MessageList: React.FC<MessageListProps> = React.memo(({ messages, isLoading }) => {
  return (
    <div className="message-list">
      {messages.map((m) => (
        <Message key={m.id} message={m} />
      ))}
      <TypingIndicator isVisible={isLoading} />
    </div>
  );
});

export default MessageList;