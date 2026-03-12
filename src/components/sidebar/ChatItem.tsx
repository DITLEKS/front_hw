import React from 'react';
import { Chat } from '../../types/chat';

interface ChatItemProps {
  chat: Chat;
  active?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const ChatItem: React.FC<ChatItemProps> = ({ chat, active = false, onClick, onEdit, onDelete }) => {
  return (
    <div
      className={`chat-item ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="chat-info">
        <span className="chat-name" title={chat.name}>
          {chat.name}
        </span>
        <span className="chat-date">{chat.lastMessageDate}</span>
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
};

export default ChatItem;