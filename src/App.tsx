import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './app/router/routes';
import AuthForm from './components/auth/AuthForm';
import Toggle from './components/ui/Toggle';

const App: React.FC = () => {
  const [authorized, setAuthorized] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  if (!authorized) {
    return <AuthForm onLogin={() => setAuthorized(true)} />;
  }

  return (
    <BrowserRouter>
      <div className="top-controls">
        <Toggle theme={theme} onToggle={toggleTheme} />
      </div>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;