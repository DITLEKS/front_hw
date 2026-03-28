import React, { useState } from 'react';
import SearchInput from './SearchInput';
import ChatList from './ChatList';
import { Chat } from '../../types/chat';

const Sidebar: React.FC = () => {
  const [search, setSearch] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const createNewChat = () => {
    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      name: `Новый чат ${chats.length + 1}`,
      lastMessageDate: new Date().toLocaleTimeString(),
      lastMessage: '',
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveId(newChat.id);
  };

  const handleSelect = (chat: Chat) => {
    setActiveId(chat.id);
  };

  const handleEdit = (chat: Chat) => {
    const newName = window.prompt('Новое имя чата', chat.name);
    if (newName && newName.trim()) {
      setChats((prev) =>
        prev.map((item) => (item.id === chat.id ? { ...item, name: newName.trim() } : item))
      );
    }
  };

  const handleDelete = (chat: Chat) => {
    if (window.confirm('Удалить чат?')) {
      setChats((prev) => prev.filter((item) => item.id !== chat.id));
      if (activeId === chat.id) {
        setActiveId(null);
      }
    }
  };

  return (
    <div className="sidebar">
      <button className="new-chat" onClick={createNewChat} type="button">
        + Новый чат
      </button>
      <SearchInput value={search} onChange={setSearch} />
      <ChatList
        chats={chats.filter((chat) =>
          chat.name.toLowerCase().includes(search.toLowerCase())
        )}
        activeId={activeId}
        onSelect={handleSelect}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Sidebar;