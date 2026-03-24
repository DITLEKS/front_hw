import React, { useState, useEffect, useRef } from 'react';
import MessageList from './MessageList';
import InputArea from './InputArea';
import TypingIndicator from './TypingIndicator';
import SettingsPanel from '../settings/SettingsPanel';
import { Message } from '../../types/message';

const GIGACHAT_TOKEN = 'MDE5ZDFlOTctODlmZC03NTE0LWI4ZjEtNTlkZjFkY2VkMzhlOmVmN2FiNDM2LTA5NmUtNDJhZC04NzRkLTYwNmEwMmViZmJkMw==';

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const getAccessToken = async (): Promise<string> => {
    if (accessToken) return accessToken;

    const response = await fetch('http://localhost:3001/api/oauth', {
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
    const response = await fetch('http://localhost:3001/api/chat', {
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
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

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
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: 'Извините, произошла ошибка при обработке вашего сообщения.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h2>Чат</h2>
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

      <InputArea onSend={handleSend} isLoading={isLoading} />

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