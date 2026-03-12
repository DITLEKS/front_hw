import React, { useState } from 'react';
import MessageList from './MessageList';
import InputArea from './InputArea';
import TypingIndicator from './TypingIndicator';
import SettingsPanel from '../settings/SettingsPanel';
import { messages as mockMessages } from '../../mocks/messages';

const ChatWindow: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);

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
        <MessageList messages={mockMessages} />
        <TypingIndicator isVisible={false} />
      </div>

      <InputArea />

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