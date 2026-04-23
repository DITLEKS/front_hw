import React, { lazy, Suspense } from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { useChatStore } from '../../stores/chatStore';

const ChatWindow = lazy(() => import('../../components/chat/ChatWindow'));

const PageLoader = () => (
  <div className="page-loader">
    <div className="page-loader__spinner" />
    <span>Загрузка…</span>
  </div>
);

const ChatWindowRoute: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return <ChatWindow key={id} />;
};

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
                <ChatWindow key={activeChatId} chatId={activeChatId} />
              ) : (
                <div className="empty-state">
                  <h2>Выберите чат или создайте новый</h2>
                </div>
              )
            }
          />
          <Route path="/chat/:id" element={<ChatWindowRoute />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
};

export default AppRoutes;