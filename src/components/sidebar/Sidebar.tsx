import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchInput from './SearchInput';
import ChatList from './ChatList';
import Dialog from '../ui/Dialog';
import { useChatStore } from '../../stores/chatStore';

const Sidebar: React.FC = () => {
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

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
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      setRenameValue(chat.name);
      setRenameTarget(chatId);
    }
  }, [chats]);

  const handleDelete = useCallback((chatId: string) => {
    setDeleteTarget(chatId);
  }, []);

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteChat(deleteTarget);
      if (activeChatId === deleteTarget) {
        navigate('/');
      }
      setDeleteTarget(null);
    }
  };

  const confirmRename = () => {
    if (renameTarget && renameValue.trim()) {
      updateChat(renameTarget, { name: renameValue.trim() });
    }
    setRenameTarget(null);
  };

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

      <Dialog
        isOpen={!!deleteTarget}
        title="Удалить чат?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        confirmLabel="Удалить"
        danger
      />

      <Dialog
        isOpen={!!renameTarget}
        title="Переименовать чат"
        onConfirm={confirmRename}
        onCancel={() => setRenameTarget(null)}
        confirmLabel="Сохранить"
      >
        <input
          type="text"
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') confirmRename(); }}
          autoFocus
        />
      </Dialog>
    </div>
  );
};

export default Sidebar;