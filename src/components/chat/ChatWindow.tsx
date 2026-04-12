import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import MessageList from './MessageList';
import InputArea from './InputArea';
import TypingIndicator from './TypingIndicator';
import ErrorBoundary from '../ui/ErrorBoundary';
import { useChatStore } from '../../stores/chatStore';
import { Message } from '../../types/message';

const SettingsPanel = lazy(() => import('../settings/SettingsPanel'));

interface ChatWindowProps {
  chatId?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatId: propChatId }) => {
  const { id: urlChatId } = useParams<{ id: string }>();
  const chatId = propChatId || urlChatId;

  const { chats, activeChatId, addMessage, setLoading, setError, generateChatName, setActiveChat } = useChatStore();
  const [showSettings, setShowSettings] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chat = chats.find(c => c.id === chatId);
  const messages = chat?.messages || [];
  const isLoading = useChatStore(state => state.isLoading);

  useEffect(() => {
    if (chatId && chatId !== activeChatId) {
      setActiveChat(chatId);
    }
  }, [chatId, activeChatId, setActiveChat]);

  const getAccessToken = useCallback(async (): Promise<string> => {
    if (accessToken) return accessToken;
    const response = await fetch('http://localhost:3002/api/oauth', { method: 'POST' });
    if (!response.ok) throw new Error('Failed to get access token');
    const data = await response.json();
    const token = data.access_token;
    setAccessToken(token);
    return token;
  }, [accessToken]);

  const sendMessageToGigaChat = useCallback(async (
    messagesForAPI: { role: string; content: string }[]
  ): Promise<string> => {
    const response = await fetch('http://localhost:3002/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'GigaChat', messages: messagesForAPI, stream: false }),
    });
    if (!response.ok) throw new Error('Failed to send message');
    const data = await response.json();
    return data.choices[0].message.content;
  }, []);

  const handleSend = useCallback(async (content: string) => {
    if (!chatId) return;
    setSendError(null);

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    addMessage(chatId, userMessage);
    setLoading(true);

    try {
      const messagesForAPI = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const assistantContent = await sendMessageToGigaChat(messagesForAPI);

      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      };
      addMessage(chatId, assistantMessage);

      if (messages.length === 0) {
        generateChatName(chatId);
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Неизвестная ошибка';
      setSendError(`Ошибка отправки: ${errMsg}`);
      setError(errMsg);

      const errorMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: 'Извините, произошла ошибка при обработке вашего сообщения.',
        timestamp: new Date(),
      };
      addMessage(chatId, errorMessage);
    } finally {
      setLoading(false);
    }
  }, [chatId, messages, addMessage, setLoading, setError, generateChatName, sendMessageToGigaChat]);

  const handleStop = useCallback(() => {
    setLoading(false);
  }, [setLoading]);

  const handleRetry = useCallback(() => {
    setSendError(null);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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

      <div className="chat-body">
        {/* ErrorBoundary изолирует ошибки рендера сообщений */}
        <ErrorBoundary>
          <MessageList messages={messages} isLoading={isLoading} />
        </ErrorBoundary>
        <div ref={scrollRef} />
      </div>

      {/* Ошибка API отображается под списком, не ломает интерфейс */}
      {sendError && (
        <div className="send-error">
          <span>⚠️ {sendError}</span>
          <button onClick={handleRetry} className="send-error__retry">Повторить</button>
        </div>
      )}

      <InputArea onSend={handleSend} isLoading={isLoading} onStop={handleStop} />

      {showSettings && (
        <div className="settings-modal" onClick={() => setShowSettings(false)}>
          <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowSettings(false)}>×</button>
            {/* Suspense + lazy: SettingsPanel загружается только при открытии */}
            <Suspense fallback={<div className="settings-loading">Загрузка настроек…</div>}>
              <SettingsPanel />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
