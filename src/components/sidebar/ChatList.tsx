import React, { useState } from 'react';
import ChatItem from './ChatItem';
import { Chat } from '../../types/chat';

const ChatList: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleSelect = (chat: Chat) => {
    setActiveId(chat.id);
  };

  const handleEdit = (chat: Chat) => {
    console.log('edit', chat.id);
  };

  const handleDelete = (chat: Chat) => {
    console.log('delete', chat.id);
  };

  return (
    <div className="chat-list">
      {chats.length === 0 ? (
        <div className="empty-chats">Нет чатов</div>
      ) : (
        chats.map((chat) => (
          <ChatItem
            key={chat.id}
            chat={chat}
            active={chat.id === activeId}
            onClick={() => handleSelect(chat)}
            onEdit={() => handleEdit(chat)}
            onDelete={() => handleDelete(chat)}
          />
        ))
      )}
    </div>
  );
};

export default ChatList;