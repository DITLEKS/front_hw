import React from 'react';
import ChatItem from './ChatItem';
import { Chat } from '../../types/chat';

interface ChatListProps {
  chats: Chat[];
  activeId: string | null;
  onSelect: (chatId: string) => void;
  onEdit: (chatId: string) => void;
  onDelete: (chatId: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ chats, activeId, onSelect, onEdit, onDelete }) => {
  if (chats.length === 0) {
    return (
      <div className="chat-list">
        <div className="empty-chats">Нет чатов</div>
      </div>
    );
  }

  return (
    <div className="chat-list">
      {chats.map((chat) => (
        <ChatItem
          key={chat.id}
          chat={chat}
          active={chat.id === activeId}
          onClick={() => onSelect(chat.id)}
          onEdit={() => onEdit(chat.id)}
          onDelete={() => onDelete(chat.id)}
        />
      ))}
    </div>
  );
};

export default ChatList;