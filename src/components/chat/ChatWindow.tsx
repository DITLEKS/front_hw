import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import MessageList from './MessageList';
import InputArea from './InputArea';
import ErrorBoundary from '../ui/ErrorBoundary';
import { useChatStore } from '../../stores/chatStore';
import { useChatSender } from '../../hooks/useChatSender';

const SettingsPanel = lazy(() => import('../settings/SettingsPanel'));

interface AttachedImage {
  url: string;
  alt: string;
  mimeType: string;
}

interface ChatWindowProps {
  chatId?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatId: propChatId }) => {
  const { id: urlChatId } = useParams<{ id: string }>();
  const chatId = propChatId || urlChatId;

  const [showSettings, setShowSettings] = useState(false);
  const [attachedImages, setAttachedImages] = useState<AttachedImage[]>([]);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  const { chats, activeChatId, setLoading, setActiveChat, clearError } = useChatStore();
  const error = useChatStore((state) => state.error);
  const { sendChatMessage, stop } = useChatSender();

  const chat = chats.find((c) => c.id === chatId);
  const messages = chat?.messages || [];
  const isLoading = useChatStore((state) => state.isLoading);

  useEffect(() => {
    if (chatId && chatId !== activeChatId) {
      setActiveChat(chatId);
    }
  }, [chatId, activeChatId, setActiveChat]);

  // Прокручиваем чат вниз к последнему сообщению
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(async (content: string) => {
    if (!chatId) return;
    await sendChatMessage(chatId, content, attachedImages.length > 0 ? attachedImages : undefined);
    setAttachedImages([]);
  }, [chatId, attachedImages, sendChatMessage]);

  const handleAttachImage = useCallback((img: AttachedImage) => {
    setAttachedImages((prev) => [...prev, img]);
  }, []);

  const handleStop = useCallback(() => {
    stop();
    setLoading(false);
  }, [stop, setLoading]);

  const handleClearError = useCallback(() => {
    clearError();
  }, [clearError]);

  if (!chat) {
    return <div className="chat-window">Чат не найден</div>;
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h2>{chat.name}</h2>
        <button className="settings-button" type="button" aria-label="Открыть настройки" onClick={() => setShowSettings(true)}>
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
          <button onClick={handleClearError} className="send-error__retry">Закрыть</button>
        </div>
      )}

      <InputArea
        onSend={handleSend}
        onAttachImage={handleAttachImage}
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