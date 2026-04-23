import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import MessageList from './MessageList';
import InputArea from './InputArea';
import TypingIndicator from './TypingIndicator';
import ErrorBoundary from '../ui/ErrorBoundary';
import { useChatStore } from '../../stores/chatStore';
import { Message } from '../../types/message';
import { useGigaChat } from '../../hooks/useGigaChat';
import { loadSettings } from '../../utils/settings';

// Ленивая загрузка SettingsPanel
const SettingsPanel = lazy(() => import('../settings/SettingsPanel'));

interface ChatWindowProps {
  chatId?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatId: propChatId }) => {
  const { id: urlChatId } = useParams<{ id: string }>();
  const chatId = propChatId || urlChatId;

  const { chats, activeChatId, addMessage, updateMessage, setLoading, setError, generateChatName, setActiveChat } = useChatStore();
  const [showSettings, setShowSettings] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [attachedImage, setAttachedImage] = useState<{ url: string; alt: string; mimeType: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { sendMessage, stop } = useGigaChat();

  const chat = chats.find(c => c.id === chatId);
  const messages = chat?.messages || [];
  const isLoading = useChatStore(state => state.isLoading);

  useEffect(() => {
    if (chatId && chatId !== activeChatId) {
      setActiveChat(chatId);
    }
  }, [chatId, activeChatId, setActiveChat]);

  const handleSend = useCallback(async (content: string) => {
    if (!chatId) return;
    setSendError(null);

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      ...(attachedImage ? {
        imageUrl: attachedImage.url,
        imageAlt: attachedImage.alt,
        imageMimeType: attachedImage.mimeType,
      } : {}),
    };
    addMessage(chatId, userMessage);
    setAttachedImage(null);
    setLoading(true);

    const assistantMessageId = `msg-${Date.now() + 1}`;
    addMessage(chatId, {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    });

    try {
      const settings = loadSettings();
      const messagesForAPI = [...messages, userMessage].map((message) => {
        if (message.imageUrl) {
          return {
            role: message.role,
            content: {
              type: 'image',
              mime_type: message.imageMimeType || 'image/png',
              alt: message.imageAlt || 'image',
              data: message.imageUrl,
            },
          };
        }

        return {
          role: message.role,
          content: message.content,
        };
      });

      if (settings.systemPrompt.trim()) {
        messagesForAPI.unshift({ role: 'system', content: settings.systemPrompt });
      }

      let assistantContent = '';
      await sendMessage(
        {
          model: settings.model,
          messages: messagesForAPI,
          temperature: settings.temperature,
          top_p: settings.topP,
          max_tokens: settings.maxTokens,
          repetition_penalty: settings.repetitionPenalty,
          stream: true,
        },
        (chunk) => {
          assistantContent += chunk;
          updateMessage(chatId, assistantMessageId, assistantContent);
        }
      );

      if (messages.length === 0) {
        generateChatName(chatId);
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Неизвестная ошибка';
      setSendError(`Ошибка отправки: ${errMsg}`);
      setError(errMsg);
      updateMessage(chatId, assistantMessageId, 'Извините, произошла ошибка при обработке вашего сообщения.');
    } finally {
      setLoading(false);
    }
  }, [chatId, messages, addMessage, updateMessage, setLoading, setError, generateChatName, sendMessage]);

  const handleStop = useCallback(() => {
    stop();
    setLoading(false);
  }, [stop, setLoading]);

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

      <InputArea onSend={handleSend} onAttachImage={setAttachedImage} isLoading={isLoading} onStop={handleStop} />

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
