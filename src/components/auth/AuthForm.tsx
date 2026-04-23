import React, { useState } from 'react';

type Scope = 'GIGACHAT_API_PERS' | 'GIGACHAT_API_B2B' | 'GIGACHAT_API_CORP';

interface AuthFormProps {
  onLogin?: () => void;
}

const SCOPES: { value: Scope; label: string }[] = [
  { value: 'GIGACHAT_API_PERS', label: 'Personal (PERS)' },
  { value: 'GIGACHAT_API_B2B',  label: 'Business (B2B)'  },
  { value: 'GIGACHAT_API_CORP', label: 'Corporate (CORP)' },
];

const AuthForm: React.FC<AuthFormProps> = ({ onLogin }) => {
  const [credentials, setCredentials] = useState('');
  const [scope, setScope] = useState<Scope>('GIGACHAT_API_PERS');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!credentials.trim()) {
      setError('Пожалуйста, введите Credentials (Base64)');
      return;
    }

    // Сохраняем авторизацию чтобы не логиниться после перезагрузки
    try {
      localStorage.setItem('auth', JSON.stringify({ credentials, scope }));
    } catch {
      // ignore
    }

    onLogin?.();
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-container">
        <h1>GigaChat</h1>
        <h2>Войти в аккаунт</h2>

        <label htmlFor="credentials">
          Credentials (Base64):
          <input
            id="credentials"
            type="password"
            value={credentials}
            onChange={(e) => { setCredentials(e.target.value); setError(''); }}
            placeholder="Base64(ClientId:ClientSecret)"
            autoComplete="current-password"
          />
        </label>

        <fieldset className="auth-scope">
          <legend>Scope</legend>
          {SCOPES.map(({ value, label }) => (
            <label key={value} className="auth-scope__option">
              <input
                type="radio"
                name="scope"
                value={value}
                checked={scope === value}
                onChange={() => setScope(value)}
              />
              {label}
            </label>
          ))}
        </fieldset>

        {error && <div className="error-text">{error}</div>}

        <button type="submit" className="submit-btn">Войти</button>

        <p className="demo-text">Введите ваши Credentials от GigaChat API</p>
      </div>
    </form>
  );
};

export default AuthForm;