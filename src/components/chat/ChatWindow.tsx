import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import MessageList from './MessageList';
import InputArea from './InputArea';
import ErrorBoundary from '../ui/ErrorBoundary';
import { useChatStore } from '../../stores/chatStore';
import { useChatSender } from '../../hooks/useChatSender';

const SettingsPanel = lazy(() => import('../settings/SettingsPanel'));

interface ChatWindowProps {
  chatId?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatId: propChatId }) => {
  const { id: urlChatId } = useParams<{ id: string }>();
  const chatId = propChatId || urlChatId;

  const [showSettings, setShowSettings] = useState(false);
  const [attachedImage, setAttachedImage] = useState<{ url: string; alt: string; mimeType: string } | null>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  const { chats, activeChatId, setLoading, setActiveChat } = useChatStore();
  const error = useChatStore((state) => state.error);
  const clearError = () => useChatStore.setState({ error: null });
  const { sendChatMessage, stop } = useChatSender();

  const chat = chats.find((c) => c.id === chatId);
  const messages = chat?.messages || [];
  const isLoading = useChatStore((state) => state.isLoading);

  useEffect(() => {
    if (chatId && chatId !== activeChatId) {
      setActiveChat(chatId);
    }
  }, [chatId, activeChatId, setActiveChat]);

  // Автоскролл к последнему сообщению
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (content: string) => {
    if (!chatId) return;
    await sendChatMessage(chatId, content, attachedImage || undefined);
    setAttachedImage(null);
  };

  const handleStop = () => {
    stop();
    setLoading(false);
  };

  if (!chat) {
    return <div className="chat-window">Чат не найден</div>;
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h2>{chat.name}</h2>
        <button className="settings-button" onClick={() => setShowSettings(true)}>
          ⚙
        </button>
      </div>

      <div className="chat-body" ref={chatBodyRef}>
        <ErrorBoundary>
          <MessageList key={chatId} messages={messages} isLoading={isLoading} />
        </ErrorBoundary>
      </div>

      {error && (
        <div className="send-error">
          <span>⚠️ {error}</span>
          <button onClick={clearError} className="send-error__retry">Закрыть</button>
        </div>
      )}

      <InputArea
        onSend={handleSend}
        onAttachImage={setAttachedImage}
        isLoading={isLoading}
        onStop={handleStop}
      />

      {showSettings && (
        <div className="settings-modal" onClick={() => setShowSettings(false)}>
          <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowSettings(false)}>×</button>
            <Suspense fallback={<div className="settings-loading">Загрузка настроек…</div>}>
              <SettingsPanel onClose={() => setShowSettings(false)} />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;