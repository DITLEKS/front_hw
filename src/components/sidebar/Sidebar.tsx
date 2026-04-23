import React, { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchInput from './SearchInput';
import ChatList from './ChatList';
import { useChatStore } from '../../stores/chatStore';

const Sidebar: React.FC = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { chats, activeChatId, createChat, updateChat, deleteChat, setActiveChat } = useChatStore();

  const handleCreateNewChat = useCallback(() => {
    const newChatId = createChat();
    navigate(`/chat/${newChatId}`);
  }, [createChat, navigate]);

  const handleSelect = useCallback((chatId: string) => {
    setActiveChat(chatId);
    navigate(`/chat/${chatId}`);
  }, [setActiveChat, navigate]);

  const handleEdit = useCallback((chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      const newName = window.prompt('Новое имя чата', chat.name);
      if (newName && newName.trim()) {
        updateChat(chatId, { name: newName.trim() });
      }
    }
  }, [chats, updateChat]);

  const handleDelete = useCallback((chatId: string) => {
    if (window.confirm('Удалить чат?')) {
      deleteChat(chatId);
      if (activeChatId === chatId) {
        navigate('/');
      }
    }
  }, [deleteChat, activeChatId, navigate]);

  // useMemo не пересчитывает список при каждом рендере сайдбара
  const filteredChats = useMemo(() =>
    chats.filter((chat) => {
      const query = search.toLowerCase();
      const matchName = chat.name.toLowerCase().includes(query);
      const matchLastMessage = chat.lastMessage.toLowerCase().includes(query);
      const matchMessages = chat.messages.some((message) =>
        message.content.toLowerCase().includes(query)
      );

      return matchName || matchLastMessage || matchMessages;
    }),
    [chats, search]
  );

  return (
    <div className="sidebar">
      <button className="new-chat" onClick={handleCreateNewChat} type="button">
        + Новый чат
      </button>
      <SearchInput value={search} onChange={setSearch} />
      <ChatList
        chats={filteredChats}
        activeId={activeChatId}
        onSelect={handleSelect}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Sidebar;
