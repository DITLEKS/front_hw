import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { useChatStore } from '../../stores/chatStore';

// Ленивая загрузка роутов, каждый роут в отдельном чанке
const ChatWindow = lazy(() => import('../../components/chat/ChatWindow'));

const PageLoader = () => (
  <div className="page-loader">
    <div className="page-loader__spinner" />
    <span>Загрузка…</span>
  </div>
);

const AppRoutes: React.FC = () => {
  const { activeChatId } = useChatStore();

  return (
    <AppLayout>
      <Suspense fallback={<PageLoader />}>
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
          <Route path="/chat/:id" element={<ChatWindow />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
};

export default AppRoutes;
