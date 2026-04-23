import React, { memo } from 'react';
import { Chat } from '../../types/chat';

interface ChatItemProps {
  chat: Chat;
  active?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const ChatItem: React.FC<ChatItemProps> = memo(({ chat, active = false, onClick, onEdit, onDelete }) => {
  const formatDate = (timestamp: string) => {
    try {
      return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(timestamp));
    } catch {
      return timestamp;
    }
  };

  return (
    <div
      className={`chat-item ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="chat-info">
        <span className="chat-name" title={chat.name}>
          {chat.name}
        </span>
        <span className="chat-date">{formatDate(chat.lastMessageDate)}</span>
      </div>
      <div className="chat-actions">
        <button
          className="edit"
          aria-label="Edit chat"
          onClick={(e) => { e.stopPropagation(); onEdit && onEdit(); }}
        >
          ✏️
        </button>
        <button
          className="delete"
          aria-label="Delete chat"
          onClick={(e) => { e.stopPropagation(); onDelete && onDelete(); }}
        >
          🗑️
        </button>
      </div>
    </div>
  );
});

ChatItem.displayName = 'ChatItem';

export default ChatItem;
