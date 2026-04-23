import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchInput from './SearchInput';
import ChatList from './ChatList';
import Dialog from '../ui/Dialog';
import { useChatStore } from '../../stores/chatStore';
import { loadSettings, saveSettings } from '../../utils/settings';

type Submenu = 'theme' | null;

const Sidebar: React.FC = () => {
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [submenu, setSubmenu] = useState<Submenu>(null);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(
    () => loadSettings().theme
  );
  const menuRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { chats, activeChatId, createChat, updateChat, deleteChat, setActiveChat } = useChatStore();

  useEffect(() => {
    if (!showMenu) { setSubmenu(null); return; }
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

  const applyTheme = (theme: 'light' | 'dark') => {
    setCurrentTheme(theme);
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
    const s = loadSettings();
    saveSettings({ ...s, theme });
    setShowMenu(false);
  };

  const handleCreateNewChat = useCallback(() => {
    const id = createChat();
    navigate(`/chat/${id}`);
  }, [createChat, navigate]);

  const handleSelect = useCallback((chatId: string) => {
    setActiveChat(chatId);
    navigate(`/chat/${chatId}`);
  }, [setActiveChat, navigate]);

  const handleEdit = useCallback((chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) { setRenameValue(chat.name); setRenameTarget(chatId); }
  }, [chats]);

  const handleDelete = useCallback((chatId: string) => setDeleteTarget(chatId), []);

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteChat(deleteTarget);
      if (activeChatId === deleteTarget) navigate('/');
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
    chats.filter(chat => {
      const q = search.toLowerCase();
      return (
        chat.name.toLowerCase().includes(q) ||
        chat.lastMessage.toLowerCase().includes(q) ||
        chat.messages.some(m => m.content.toLowerCase().includes(q))
      );
    }), [chats, search]);

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

      {/* ===== ФУТЕР ===== */}
      <div className="sidebar-footer" ref={menuRef}>
        <button
          className={`sidebar-user-btn${showMenu ? ' active' : ''}`}
          onClick={() => setShowMenu(v => !v)}
          type="button"
          aria-label="Меню пользователя"
          aria-expanded={showMenu}
        >
          <div className="sidebar-user-avatar">А</div>
          <span className="sidebar-user-name">Александра</span>
          <svg
            className={`sidebar-user-chevron${showMenu ? ' rotated' : ''}`}
            width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
          >
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>

        {/* ===== POPOVER ===== */}
        {showMenu && (
          <div className="sidebar-popover">

            {/* Внешний вид → подменю тем */}
            <div
              className={`sidebar-popover-item${submenu === 'theme' ? ' active' : ''}`}
              onMouseEnter={() => setSubmenu('theme')}
              onClick={() => setSubmenu(s => s === 'theme' ? null : 'theme')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              <div className="sidebar-popover-item-text">
                <span>Внешний вид</span>
                <small>{currentTheme === 'dark' ? 'Тёмная' : 'Светлая'}</small>
              </div>
              <svg
                className="sidebar-popover-arrow"
                width="12" height="12" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>

              {submenu === 'theme' && (
                <div className="sidebar-submenu">
                  <button
                    className="sidebar-submenu-item"
                    onClick={(e) => { e.stopPropagation(); applyTheme('light'); }}
                    type="button"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="5" />
                      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                    </svg>
                    <span>Светлая</span>
                    {currentTheme === 'light' && (
                      <span className="sidebar-submenu-check">✓</span>
                    )}
                  </button>
                  <button
                    className="sidebar-submenu-item"
                    onClick={(e) => { e.stopPropagation(); applyTheme('dark'); }}
                    type="button"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                    <span>Тёмная</span>
                    {currentTheme === 'dark' && (
                      <span className="sidebar-submenu-check">✓</span>
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="sidebar-popover-divider" />

            {/* Инфо пользователя */}
            <div
              className="sidebar-popover-item sidebar-popover-item--info"
              onMouseEnter={() => setSubmenu(null)}
            >
              <div className="sidebar-user-avatar" style={{ width: 28, height: 28, fontSize: 12 }}>А</div>
              <div className="sidebar-popover-item-text">
                <span>Александра</span>
                <small>Пользователь</small>
              </div>
            </div>

          </div>
        )}
      </div>

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
          onChange={e => setRenameValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') confirmRename(); }}
          autoFocus
        />
      </Dialog>
    </div>
  );
};

export default Sidebar;