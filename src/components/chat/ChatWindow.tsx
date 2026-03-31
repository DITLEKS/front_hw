import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import MessageList from './MessageList';
import InputArea from './InputArea';
import TypingIndicator from './TypingIndicator';
import SettingsPanel from '../settings/SettingsPanel';
import { useChatStore } from '../../stores/chatStore';
import { Message } from '../../types/message';

interface ChatWindowProps {
  chatId?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatId: propChatId }) => {
  const { id: urlChatId } = useParams<{ id: string }>();
  const chatId = propChatId || urlChatId;

  const { chats, activeChatId, addMessage, setLoading, setError, generateChatName, setActiveChat } = useChatStore();
  const [showSettings, setShowSettings] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chat = chats.find(c => c.id === chatId);
  const messages = chat?.messages || [];
  const isLoading = useChatStore(state => state.isLoading);

  useEffect(() => {
    if (chatId && chatId !== activeChatId) {
      setActiveChat(chatId);
    }
  }, [chatId, activeChatId, setActiveChat]);

  const getAccessToken = async (): Promise<string> => {
    if (accessToken) return accessToken;

    const response = await fetch('http://localhost:3002/api/oauth', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to get access token');
    }

    const data = await response.json();
    const token = data.access_token;
    setAccessToken(token);
    return token;
  };

  const sendMessageToGigaChat = async (messagesForAPI: { role: string; content: string }[]): Promise<string> => {
    const response = await fetch('http://localhost:3002/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'GigaChat',
        messages: messagesForAPI,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  };

  const handleSend = async (content: string) => {
    if (!chatId) return;

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

      // Generate name if first message
      if (messages.length === 0) {
        generateChatName(chatId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: 'Извините, произошла ошибка при обработке вашего сообщения.',
        timestamp: new Date(),
      };
      addMessage(chatId, errorMessage);
      setError('Ошибка при отправке сообщения');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleStop = () => {
    setLoading(false);
  };

  if (!chat) {
    return <div className="chat-window">Чат не найден</div>;
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h2>{chat.name}</h2>
        <button
          className="settings-button"
          onClick={() => setShowSettings(true)}
        >
          ⚙
        </button>
      </div>

      <div className="chat-body">
        <MessageList messages={messages} isLoading={isLoading} />
        <div ref={scrollRef} />
      </div>

      <InputArea onSend={handleSend} isLoading={isLoading} onStop={handleStop} />

      {showSettings && (
        <div className="settings-modal" onClick={() => setShowSettings(false)}>
          <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowSettings(false)}>×</button>
            <SettingsPanel />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;