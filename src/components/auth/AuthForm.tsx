import React, { useState } from 'react';

interface AuthFormProps {
  onLogin?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onLogin }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!login.trim()) {
      setError('Пожалуйста, введите логин');
      return;
    }
    
    if (!password.trim()) {
      setError('Пожалуйста, введите пароль');
      return;
    }
    
    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }
    
    console.log('login', { login, password });
    onLogin && onLogin();
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-container">
        <h1>GigaChat</h1>
        <h2>Войти в аккаунт</h2>
        
        <label htmlFor="login">
          Логин:
          <input
            id="login"
            type="text"
            value={login}
            onChange={(e) => { setLogin(e.target.value); setError(''); }}
            placeholder="Введите ваш логин"
          />
        </label>
        
        <label htmlFor="password">
          Пароль:
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            placeholder="Введите ваш пароль"
          />
        </label>
        
        {error && <div className="error-text">{error}</div>}
        
        <button type="submit" className="submit-btn">Войти</button>
        
        <p className="demo-text">любые логин и пароль (мин. 6 символов)</p>
      </div>
    </form>
  );
};

export default AuthForm;