import React, { useState } from 'react';
import AppLayout from './components/layout/AppLayout';
import ChatWindow from './components/chat/ChatWindow';
import AuthForm from './components/auth/AuthForm';

const App: React.FC = () => {
  const [authorized, setAuthorized] = useState(false);

  // in real app, we'd check some auth token
  if (!authorized) {
    return <AuthForm onLogin={() => setAuthorized(true)} />;
  }

  return (
    <AppLayout>
      <ChatWindow />
    </AppLayout>
  );
};

export default App;