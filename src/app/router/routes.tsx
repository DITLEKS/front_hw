import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import ChatWindow from '../../components/chat/ChatWindow';
import { useChatStore } from '../../stores/chatStore';

const AppRoutes: React.FC = () => {
  const { activeChatId } = useChatStore();

  return (
    <AppLayout>
      <Routes>
        <Route
          path="/"
          element={
            activeChatId ? (
              <ChatWindow chatId={activeChatId} />
            ) : (
              <div className="empty-state">
                <h2>Выберите чат или создайте новый</h2>
              </div>
            )
          }
        />
        <Route
          path="/chat/:id"
          element={<ChatWindow />}
        />
      </Routes>
    </AppLayout>
  );
};

export default AppRoutes;