import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './app/router/routes';
import AuthForm from './components/auth/AuthForm';
import { loadSettings, saveSettings } from './utils/settings';

const App: React.FC = () => {
  const [authorized, setAuthorized] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem('auth');
    } catch {
      return false;
    }
  });

  const [theme] = useState<'light' | 'dark'>(() => loadSettings().theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
    const settings = loadSettings();
    saveSettings({ ...settings, theme });
  }, [theme]);

  if (!authorized) {
    return <AuthForm onLogin={() => setAuthorized(true)} />;
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;